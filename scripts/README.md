# Publish Scripts

Automated scripts for publishing the Blossom Carousel packages to npm.

## Usage

### Publish with patch version bump (0.2.0 → 0.2.1)

```bash
pnpm publish:all
```

### Publish with minor version bump (0.2.0 → 0.3.0)

```bash
pnpm publish:minor
```

### Publish with major version bump (0.2.0 → 1.0.0)

```bash
pnpm publish:major
```

## What the script does

1. **Builds and publishes `@blossom-carousel/core`**

   - Bumps version
   - Runs build
   - Publishes to npm

2. **Updates core dependency in all dependent packages**

   - Updates `@blossom-carousel/react`
   - Updates `@blossom-carousel/vue`
   - Updates `@blossom-carousel/svelte`
   - Updates `@blossom-carousel/web`

3. **Builds and publishes all dependent packages**

   - Bumps version for each package
   - Runs build for each package
   - Publishes each to npm

4. **Shows summary**
   - Lists all published versions
   - Provides next steps for git commits and tags

## Prerequisites

- You must be logged in to npm: `npm login`
- You must have publish access to the `@blossom-carousel` scope
- All changes should be committed before running (or you'll have dirty git state)

## Manual publish (if needed)

If you need to publish a single package:

```bash
cd packages/core
pnpm build
npm version patch  # or minor, or major
npm publish
```

## Troubleshooting

If the script fails:

1. **Check npm login**: Run `npm whoami` to verify you're logged in
2. **Check permissions**: Ensure you have publish rights to `@blossom-carousel`
3. **Check build errors**: Look at the output for any TypeScript or build errors
4. **Check network**: Ensure you have a stable internet connection

## Notes

- The script uses `--no-git-tag-version` to prevent automatic git tagging
- You should manually commit, tag, and push after the script completes
- All packages are set to `"access": "public"` in their publishConfig
