# Version Management System

## Overview

Single source of truth for version numbers, managed through `version.config.js`.

---

## Quick Start

### Update Version & Deploy

```bash
# Option 1: Auto-increment version
npm run version:patch    # 0.3.7e → 0.3.7f
npm run version:minor    # 0.3.7e → 0.4.0
npm run version:major    # 0.3.7e → 1.0.0

# Option 2: Manual edit
# 1. Edit version.config.js
# 2. Run sync:
npm run version:update

# Then deploy:
git add .
git commit -m "v0.3.7f - Feature description"
git push
```

---

## Files Structure

### 1. `version.config.js` (Source of Truth)

```javascript
module.exports = {
  version: '0.3.7e',
  releaseDate: '2026-02-07',
  releaseName: '4 Artwork Sources',
  features: '4 artwork sources active',
  changelog: [
    'Feature 1',
    'Feature 2',
  ],
  apis: {
    itunes: { active: true, resolution: '3000×3000', icon: '🎵' },
    // ...
  }
};
```

### 2. `scripts/update-version.js`

Syncs version from config to:
- `package.json`
- `lib/constants.ts`

### 3. `scripts/bump-version.js`

Auto-increments version number in `version.config.js`.

### 4. `lib/constants.ts`

Exports version for use in React components:

```typescript
export const VERSION = '0.3.7e';
export const VERSION_INFO = {
  version: '0.3.7e',
  releaseDate: '2026-02-07',
  releaseName: '4 Artwork Sources',
  features: '4 artwork sources active',
};
```

---

## Usage in Code

### Import Version Constants

```typescript
import { VERSION, VERSION_INFO } from '@/lib/constants';

// Use in console
console.log(`App v${VERSION}`);

// Use in UI
<div>Version {VERSION}</div>
<div>{VERSION_INFO.features}</div>
```

### Current Usage

1. **Console Log** (on app load):
   ```typescript
   console.log(`%c MiniDisc Cover Designer v${VERSION} `, ...)
   ```

2. **Header** (top-right):
   ```tsx
   v{VERSION}
   ```

3. **Footer** (bottom-left):
   ```tsx
   Version {VERSION} • {VERSION_INFO.features}
   ```

---

## Workflows

### Workflow 1: Bug Fix (Patch)

```bash
# 1. Auto-increment
npm run version:patch
# Output: 0.3.7e → 0.3.7f

# 2. Edit version.config.js
# Update: changelog, features (if needed)

# 3. Sync
npm run version:update

# 4. Deploy
git add .
git commit -m "v0.3.7f - Fixed artwork scaling bug"
git push
```

### Workflow 2: New Feature (Minor)

```bash
# 1. Auto-increment
npm run version:minor
# Output: 0.3.7e → 0.4.0

# 2. Edit version.config.js
# Update: releaseName, features, changelog

# 3. Sync
npm run version:update

# 4. Deploy
git add .
git commit -m "v0.4.0 - Added batch export feature"
git push
```

### Workflow 3: Manual Control

```bash
# 1. Edit version.config.js manually
# Change version: '0.3.7e' to '0.3.7f'
# Update all fields

# 2. Sync
npm run version:update

# 3. Deploy
git add .
git commit -m "v0.3.7f - Multiple fixes"
git push
```

---

## Script Commands

### `npm run version:update`

Syncs version from `version.config.js` to all files.

**When to use:**
- After manually editing `version.config.js`
- To verify sync is correct

**Output:**
```
✅ Updated package.json to v0.3.7e
✅ Updated lib/constants.ts to v0.3.7e

📋 Version Summary:
   Version: 0.3.7e
   Release: 4 Artwork Sources
   ...
```

### `npm run version:patch`

Auto-increment patch version + sync.

**Examples:**
- `0.3.7e` → `0.3.7f`
- `0.3.7f` → `0.3.7g`
- `0.3.7` → `0.3.7a`

**Output:**
```
🔄 Bumping version: 0.3.7e → 0.3.7f
✅ Updated version.config.js

⚠️  Next steps:
   1. Edit version.config.js to update:
      - releaseName
      - features
      - changelog
   2. Run: npm run version:update
   3. Commit and push
```

### `npm run version:minor`

Auto-increment minor version + reset patch + sync.

**Examples:**
- `0.3.7e` → `0.4.0`
- `0.4.0` → `0.5.0`

### `npm run version:major`

Auto-increment major version + reset minor/patch + sync.

**Examples:**
- `0.3.7e` → `1.0.0`
- `1.0.0` → `2.0.0`

---

## Benefits

✅ **Single Source of Truth** - Edit one file  
✅ **Auto-Sync** - Version updates everywhere  
✅ **Can't Forget** - Script ensures consistency  
✅ **Git-Friendly** - Clear version history  
✅ **Type-Safe** - TypeScript constants  
✅ **Auto-Increment** - Bump with one command  
✅ **Changelog Tracking** - History in config  

---

## Version Format

Supports flexible versioning:

- **Standard**: `0.3.7`, `1.0.0`, `2.5.1`
- **With Letter**: `0.3.7a`, `0.3.7b`, `0.3.7e`

**Letter Versions:**
- Used for quick patches between releases
- `a` = first patch, `b` = second, etc.
- Running `version:patch` increments the letter
- Running `version:minor` resets to no letter

---

## Migration Notes

### Before (Manual):
- Edit `package.json` version
- Edit version string in `app/page.tsx` (multiple places)
- Easy to forget or mismatch

### After (Automated):
- Edit `version.config.js` once
- Run `npm run version:update`
- All locations sync automatically

---

## Troubleshooting

### Version mismatch between files

```bash
# Re-sync everything
npm run version:update
```

### Need to rollback version

```bash
# 1. Edit version.config.js to previous version
# 2. Sync
npm run version:update
# 3. Commit
git add .
git commit -m "Revert to v0.3.7d"
git push
```

### Script fails

```bash
# Check Node.js version (needs 14+)
node --version

# Check script permissions
chmod +x scripts/*.js

# Run with verbose output
node scripts/update-version.js
```

---

## Example: Full Release Cycle

```bash
# Day 1: Start new feature
# (work on code...)

# Day 2: Feature complete, ready to release
npm run version:minor
# Output: 0.3.7e → 0.4.0

# Edit version.config.js:
# - releaseName: 'Batch Export'
# - features: 'Batch PDF export'
# - changelog: ['Added batch export', 'Fixed scaling']

# Sync to all files
npm run version:update

# Test build
npm run build

# Deploy
git add .
git commit -m "v0.4.0 - Batch Export feature"
git push

# Vercel auto-deploys
# Site shows v0.4.0 everywhere! ✅
```

---

**Version management is now centralized and automated!** 🎉
