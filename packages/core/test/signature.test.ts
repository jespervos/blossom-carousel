// @vitest-environment node
//
// Vitest doesn't type-check, so this runs tsc on a fixture to pin the
// documented `Blossom(element)` call signature.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tsc = path.join(packageDir, "node_modules/.bin/tsc");

function typeErrors(file: string): string {
  try {
    execFileSync(
      tsc,
      [
        "--ignoreConfig",
        "--noEmit",
        "--strict",
        "--skipLibCheck",
        "--target", "esnext",
        "--module", "esnext",
        "--moduleResolution", "bundler",
        "--lib", "esnext,dom",
        file,
      ],
      { cwd: packageDir, encoding: "utf8", stdio: "pipe" },
    );
    return "";
  } catch (error) {
    const output = (error as { stdout?: string }).stdout ?? String(error);
    // Keep errors in the fixture and compiler-level errors (no file prefix);
    // diagnostics inside src/ aren't what this test pins.
    return output
      .split("\n")
      .filter((line) => line.includes(path.basename(file)) || line.startsWith("error TS"))
      .join("\n");
  }
}

describe("Blossom signature", () => {
  it("accepts a call without options", () => {
    expect(typeErrors("test/fixtures/blossomWithoutOptions.ts")).toBe("");
  }, 60_000);
});
