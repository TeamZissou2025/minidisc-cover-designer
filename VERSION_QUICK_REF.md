# Version Management Quick Reference

## 🚀 Quick Commands

```bash
# Auto-increment version
npm run version:patch    # 0.3.7e → 0.3.7f
npm run version:minor    # 0.3.7e → 0.4.0
npm run version:major    # 0.3.7e → 1.0.0

# Manual sync (after editing version.config.js)
npm run version:update
```

## 📝 Common Workflow

```bash
# 1. Increment version
npm run version:patch

# 2. Edit version.config.js
#    - Update: releaseName, features, changelog

# 3. Sync to all files
npm run version:update

# 4. Deploy
git add .
git commit -m "v0.3.7f - Bug fixes"
git push
```

## 📍 Where Version Appears

- Console log (on app load)
- Header (top-right corner)
- Footer (bottom-left)
- package.json
- Git commits

## 📂 Key Files

- `version.config.js` - **Edit this**
- `scripts/update-version.js` - Sync script
- `scripts/bump-version.js` - Increment script
- `lib/constants.ts` - Exports for React

## 🎯 Usage in Code

```typescript
import { VERSION, VERSION_INFO } from '@/lib/constants';

// Version string
console.log(VERSION);  // "0.3.7e"

// Version info object
console.log(VERSION_INFO.features);  // "4 artwork sources active"
```

## ✅ Benefits

- Single source of truth
- Auto-sync everywhere
- Git-friendly
- Type-safe
- Can't forget

---

**Full docs:** `VERSION_MANAGEMENT.md`
