#!/bin/bash

# Publish all packages with automatic version bumping
# Usage: ./scripts/publish-simple.sh [patch|minor|major]

set -e  # Exit on any error

VERSION_TYPE="${1:-patch}"

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "❌ Invalid version type: $VERSION_TYPE"
  echo "Usage: $0 [patch|minor|major]"
  exit 1
fi

echo "🚀 Publishing all packages with $VERSION_TYPE version bump"
echo ""

# Step 1: Publish core
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 1: Publishing @blossom-carousel/core"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd packages/core
pnpm build
npm version "$VERSION_TYPE" --no-git-tag-version
CORE_VERSION=$(node -p "require('./package.json').version")
npm publish
cd ../..
echo "✅ Published @blossom-carousel/core@$CORE_VERSION"
echo ""

# Step 2: Update core dependency in all packages
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 2: Updating core dependency"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for pkg in react vue svelte web; do
  echo "🔄 Updating $pkg..."
  cd "packages/$pkg"
  pnpm add "@blossom-carousel/core@$CORE_VERSION"
  cd ../..
done
echo ""

# Step 3: Publish all dependent packages
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 3: Publishing dependent packages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for pkg in react vue svelte web; do
  echo ""
  echo "📦 Publishing @blossom-carousel/$pkg..."
  cd "packages/$pkg"
  pnpm build
  npm version "$VERSION_TYPE" --no-git-tag-version
  PKG_VERSION=$(node -p "require('./package.json').version")
  npm publish
  echo "✅ Published @blossom-carousel/$pkg@$PKG_VERSION"
  cd ../..
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All packages published successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Next steps:"
echo "   git add ."
echo "   git commit -m \"chore: release v$CORE_VERSION\""
echo "   git tag v$CORE_VERSION"
echo "   git push && git push --tags"
echo ""
