// @vitest-environment node
//
// Type-checks the packages exactly as a consumer receives them from npm.
//
// Declaration packaging has broken repeatedly (#15, #22, #33, #37, #39, #48),
// each time in a way the workspace could not see: sources resolve fine inside
// the monorepo, with a bundler-style tsconfig, next to private packages. So
// this packs every published package, installs the tarballs into a throwaway
// project outside the repo, and compiles real consumer code against them under
// each module resolution mode TypeScript offers, with `skipLibCheck` off.
//
// The fixtures in ./consumer use `@ts-expect-error` on invalid usage, so a type
// that silently degrades to `any` fails the build as an unused directive.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturesDir = path.join(repoRoot, "test/consumer");

const packages = ["core", "react", "vue", "web", "svelte"] as const;
type PackageName = (typeof packages)[number];

/** Third-party packages the fixtures and declarations import, and who installs them. */
const externals: Record<string, PackageName> = {
  react: "react",
  "@types/react": "react",
  vue: "vue",
  svelte: "svelte",
};

const fixtures: Record<PackageName, string> = {
  core: "core.ts",
  react: "react.tsx",
  vue: "vue.ts",
  web: "web.ts",
  svelte: "svelte.ts",
};

interface Mode {
  name: string;
  /** Consumer package.json "type", which selects the import or require condition. */
  type: "module" | "commonjs";
  options: ts.CompilerOptions;
  /** Packages without an entry for this mode. */
  skip?: PackageName[];
}

// The Svelte package ships uncompiled `.svelte` components, which only a
// bundler can load. Under Node's own resolution TypeScript does not look up
// `./X.svelte.d.ts` for `./X.svelte` and falls back to Svelte's ambient
// `*.svelte` module, so those modes are not a supported way to consume it.
const nodeModes = { skip: ["svelte"] satisfies PackageName[] };

const modes: Mode[] = [
  {
    name: "nodenext, ESM consumer",
    type: "module",
    options: {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
    },
    ...nodeModes,
  },
  {
    name: "nodenext, CommonJS consumer",
    type: "commonjs",
    options: {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
    },
    ...nodeModes,
  },
  {
    name: "node16, ESM consumer",
    type: "module",
    options: {
      module: ts.ModuleKind.Node16,
      moduleResolution: ts.ModuleResolutionKind.Node16,
    },
    ...nodeModes,
  },
  {
    name: "bundler",
    type: "module",
    options: {
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    },
  },
  {
    name: "node10",
    type: "commonjs",
    options: {
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      ignoreDeprecations: "6.0",
      esModuleInterop: true,
    },
  },
];

let projectDir: string;

function installTarball(name: PackageName): void {
  const packageDir = path.join(repoRoot, "packages", name);
  execFileSync("pnpm", ["run", "build"], { cwd: packageDir, stdio: "pipe" });

  const tarballs = path.join(projectDir, "tarballs", name);
  fs.mkdirSync(tarballs, { recursive: true });
  execFileSync("pnpm", ["pack", "--pack-destination", tarballs], {
    cwd: packageDir,
    stdio: "pipe",
  });
  const [tarball] = fs.readdirSync(tarballs);

  const target = path.join(projectDir, "node_modules/@blossom-carousel", name);
  fs.mkdirSync(target, { recursive: true });
  execFileSync("tar", ["-xzf", path.join(tarballs, tarball), "--strip-components=1", "-C", target]);
}

function linkExternal(specifier: string, owner: PackageName): void {
  const require = createRequire(path.join(repoRoot, "packages", owner, "package.json"));
  const source = path.dirname(require.resolve(`${specifier}/package.json`));
  const target = path.join(projectDir, "node_modules", specifier);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.symlinkSync(source, target, "dir");
}

function consumerDir(mode: Mode): string {
  const dir = path.join(projectDir, mode.type);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ type: mode.type }));
    for (const fixture of Object.values(fixtures)) {
      fs.copyFileSync(path.join(fixturesDir, fixture), path.join(dir, fixture));
    }
  }
  return dir;
}

function typeCheck(mode: Mode, name: PackageName): string[] {
  const dir = consumerDir(mode);
  const program = ts.createProgram([path.join(dir, fixtures[name])], {
    target: ts.ScriptTarget.ESNext,
    lib: ["lib.esnext.d.ts", "lib.dom.d.ts"],
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    noEmit: true,
    skipLibCheck: false,
    types: [],
    ...mode.options,
  });

  const ours = path.join(projectDir, "node_modules/@blossom-carousel") + path.sep;
  return ts
    .getPreEmitDiagnostics(program)
    // Other libraries' declarations are theirs to keep clean.
    .filter((d) => !d.file || d.file.fileName.startsWith(dir) || d.file.fileName.startsWith(ours))
    .map((d) => {
      const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
      if (!d.file) return `TS${d.code}: ${message}`;
      const { line } = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
      return `${path.relative(projectDir, d.file.fileName)}:${line + 1} TS${d.code}: ${message}`;
    });
}

function publishedFiles(name: PackageName): string[] {
  const root = path.join(projectDir, "node_modules/@blossom-carousel", name);
  return fs
    .readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(root, path.join(entry.parentPath, entry.name)));
}

/** Every file path a manifest promises, including each nested export condition. */
function manifestTargets(manifest: Record<string, unknown>): string[] {
  const targets: string[] = [];
  const collect = (value: unknown): void => {
    if (typeof value === "string") targets.push(value);
    else if (value && typeof value === "object") Object.values(value).forEach(collect);
  };
  for (const field of ["main", "module", "types", "svelte", "unpkg", "jsdelivr", "exports"]) {
    collect(manifest[field]);
  }
  return targets;
}

beforeAll(() => {
  // realpath: macOS tmpdir is a symlink, and TypeScript reports resolved paths.
  projectDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "blossom-types-")));
  // Core first: the framework packages' declarations import it.
  for (const name of packages) installTarball(name);
  for (const [specifier, owner] of Object.entries(externals)) linkExternal(specifier, owner);
}, 300_000);

afterAll(() => {
  if (projectDir) fs.rmSync(projectDir, { recursive: true, force: true });
});

describe.each(packages)("published @blossom-carousel/%s", (name) => {
  it("ships every file its manifest points at", () => {
    const root = path.join(projectDir, "node_modules/@blossom-carousel", name);
    const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    const targets = manifestTargets(manifest);
    expect(targets.length).toBeGreaterThan(0);
    for (const target of targets) {
      expect(fs.existsSync(path.join(root, target)), target).toBe(true);
    }
  });

  it("does not reference the unpublished navigation package", () => {
    const root = path.join(projectDir, "node_modules/@blossom-carousel", name);
    const offenders = publishedFiles(name).filter(
      (file) =>
        /\.(d\.ts|d\.cts|js|cjs|svelte)$/.test(file) &&
        fs.readFileSync(path.join(root, file), "utf8").includes("@blossom-carousel/navigation"),
    );
    expect(offenders).toEqual([]);
  });

  it("ships no test files", () => {
    expect(publishedFiles(name).filter((file) => /\.test\./.test(file))).toEqual([]);
  });

  it.each(modes.filter((mode) => !mode.skip?.includes(name)))(
    "type-checks for a consumer using $name",
    (mode) => {
      expect(typeCheck(mode, name)).toEqual([]);
    },
    60_000,
  );
});
