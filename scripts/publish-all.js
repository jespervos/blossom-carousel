#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const PACKAGES = ["core", "react", "vue", "svelte", "web"];
const DEPENDENT_PACKAGES = ["react", "vue", "svelte", "web"];

/**
 * Execute a command and handle errors
 */
function exec(command, cwd = process.cwd()) {
  console.log(`\n📦 Running: ${command}`);
  try {
    execSync(command, {
      cwd,
      stdio: "inherit",
      env: { ...process.env },
    });
    return true;
  } catch (error) {
    console.error(`❌ Error executing: ${command}`);
    return false;
  }
}

/**
 * Get package.json for a package
 */
function getPackageJson(packageName) {
  const path = join(process.cwd(), "packages", packageName, "package.json");
  return JSON.parse(readFileSync(path, "utf-8"));
}

/**
 * Update package.json for a package
 */
function updatePackageJson(packageName, updates) {
  const path = join(process.cwd(), "packages", packageName, "package.json");
  const pkg = getPackageJson(packageName);
  const updated = { ...pkg, ...updates };
  writeFileSync(path, JSON.stringify(updated, null, 2) + "\n");
  console.log(`✅ Updated ${packageName} package.json`);
}

/**
 * Bump version (patch by default)
 */
function bumpVersion(version, type = "patch") {
  const [major, minor, patch] = version.split(".").map(Number);

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * Main publish flow
 */
async function main() {
  const args = process.argv.slice(2);
  const versionType = args[0] || "patch"; // patch, minor, or major

  if (!["patch", "minor", "major"].includes(versionType)) {
    console.error("❌ Invalid version type. Use: patch, minor, or major");
    process.exit(1);
  }

  console.log(`\n🚀 Starting publish process (${versionType} bump)...\n`);

  // Step 1: Build and publish core
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 Step 1: Building and publishing @blossom-carousel/core");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const corePkg = getPackageJson("core");
  const oldCoreVersion = corePkg.version;
  const newCoreVersion = bumpVersion(oldCoreVersion, versionType);

  console.log(`📈 Bumping core version: ${oldCoreVersion} → ${newCoreVersion}`);

  const corePath = join(process.cwd(), "packages", "core");

  // Build core
  if (!exec("pnpm build", corePath)) {
    console.error("❌ Core build failed");
    process.exit(1);
  }

  // Publish core with new version
  if (!exec(`npm version ${newCoreVersion} --no-git-tag-version`, corePath)) {
    console.error("❌ Core version bump failed");
    process.exit(1);
  }

  if (!exec("npm publish", corePath)) {
    console.error("❌ Core publish failed");
    process.exit(1);
  }

  console.log(
    `✅ Successfully published @blossom-carousel/core@${newCoreVersion}`
  );

  // Step 2: Update dependencies in other packages
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 Step 2: Updating core dependency in other packages");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (const pkg of DEPENDENT_PACKAGES) {
    console.log(`\n🔄 Updating ${pkg}...`);
    const packagePath = join(process.cwd(), "packages", pkg);

    // Update to latest core version
    if (
      !exec(`pnpm add @blossom-carousel/core@${newCoreVersion}`, packagePath)
    ) {
      console.error(`❌ Failed to update core dependency in ${pkg}`);
      process.exit(1);
    }

    console.log(`✅ Updated @blossom-carousel/core dependency in ${pkg}`);
  }

  // Step 3: Build and publish all dependent packages
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 Step 3: Building and publishing dependent packages");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (const pkg of DEPENDENT_PACKAGES) {
    console.log(`\n📦 Processing @blossom-carousel/${pkg}...`);

    const packagePath = join(process.cwd(), "packages", pkg);
    const packageJson = getPackageJson(pkg);
    const oldVersion = packageJson.version;
    const newVersion = bumpVersion(oldVersion, versionType);

    console.log(`📈 Bumping ${pkg} version: ${oldVersion} → ${newVersion}`);

    // Build package
    if (!exec("pnpm build", packagePath)) {
      console.error(`❌ Build failed for ${pkg}`);
      process.exit(1);
    }

    // Bump version
    if (!exec(`npm version ${newVersion} --no-git-tag-version`, packagePath)) {
      console.error(`❌ Version bump failed for ${pkg}`);
      process.exit(1);
    }

    // Publish package
    if (!exec("npm publish", packagePath)) {
      console.error(`❌ Publish failed for ${pkg}`);
      process.exit(1);
    }

    console.log(
      `✅ Successfully published @blossom-carousel/${pkg}@${newVersion}`
    );
  }

  // Step 4: Summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ All packages published successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📊 Published versions:");
  console.log(`   • @blossom-carousel/core@${newCoreVersion}`);
  for (const pkg of DEPENDENT_PACKAGES) {
    const packageJson = getPackageJson(pkg);
    console.log(`   • @blossom-carousel/${pkg}@${packageJson.version}`);
  }

  console.log("\n💡 Next steps:");
  console.log(
    '   1. Commit the version changes: git add . && git commit -m "chore: release v' +
      newCoreVersion +
      '"'
  );
  console.log("   2. Create a git tag: git tag v" + newCoreVersion);
  console.log("   3. Push changes: git push && git push --tags");
  console.log("");
}

main().catch((error) => {
  console.error("❌ Publish script failed:", error);
  process.exit(1);
});
