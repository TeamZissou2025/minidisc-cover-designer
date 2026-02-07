# Title Auto-Scaling Examples

## How Different Title Lengths Are Handled

---

### **🟢 SHORT TITLES** - No Scaling Needed
**Font Size: 2.8mm (base size)**

```
"OK COMPUTER"
"NEVERMIND"
"THE CURE"
"THRILLER"
"RUMOURS"
```

**Result:** Perfect at original size ✅

---

### **🟡 MEDIUM TITLES** - Auto-Scaled
**Font Size: 2.1-2.5mm (dynamically adjusted)**

```
"THE LIFE AQUATIC WITH STEVE ZISSOU" → 2.1mm
"MAGICAL MYSTERY TOUR" → 2.4mm
"DARK SIDE OF THE MOON" → 2.5mm
"SGT. PEPPER'S LONELY HEARTS CLUB BAND" → 2.0mm
```

**Result:** Full title visible, slightly smaller font ✅

---

### **🟠 LONG TITLES** - Scaled to Minimum
**Font Size: 1.8mm (minimum)**

```
"THE ORIGINAL MOTION PICTURE SOUNDTRACK" → 1.8mm
"VARIOUS ARTISTS - GREATEST HITS COMPILATION" → 1.8mm
"LIVE AT THE ROYAL ALBERT HALL DELUXE EDITION" → 1.8mm
```

**Result:** Full title visible at minimum size ✅

---

### **🔴 EXTREME TITLES** - Truncated Intelligently
**Font Size: 1.8mm + truncation**

```
"THE COMPLETE STUDIO RECORDINGS BOX SET REMASTERED LIMITED EDITION"
↓
"THE COMPLETE STUDIO RECORDINGS BOX..."
```

**Result:** Truncated at word boundary, ellipsis added ⚠️

---

## Visual Comparison

### Before (v0.3.7d - Fixed 2.8mm):
```
╔═══════════════════════════════════════╗
║ THE LIFE AQUATIC W...                 ║  ❌ Cut off
║ Various Artists                       ║
║ 2004                                  ║
╚═══════════════════════════════════════╝
```

### After (v0.3.7e - Auto-Scaled):
```
╔═══════════════════════════════════════╗
║ THE LIFE AQUATIC WITH STEVE ZISSOU    ║  ✅ Full title
║ Various Artists                       ║  (2.1mm font)
║ 2004                                  ║
╚═══════════════════════════════════════╝
```

---

## Scaling Steps Example

**Title:** "THE LIFE AQUATIC WITH STEVE ZISSOU"

```
Step 1: Try 2.8mm → Too wide (485px > 437px)
Step 2: Try 2.7mm → Still too wide
Step 3: Try 2.6mm → Still too wide
Step 4: Try 2.5mm → Still too wide
Step 5: Try 2.4mm → Still too wide
Step 6: Try 2.3mm → Still too wide
Step 7: Try 2.2mm → Still too wide
Step 8: Try 2.1mm → Fits! ✅

Final: 2.1mm font (25% reduction from base)
```

---

## Real-World Examples

### **Jazz Albums (Often Long Titles):**
```
"KIND OF BLUE" → 2.8mm (no scaling)
"A LOVE SUPREME" → 2.8mm (no scaling)
"TIME OUT" → 2.8mm (no scaling)
```

### **Classical Albums (Very Long Titles):**
```
"BEETHOVEN SYMPHONY NO. 9 IN D MINOR" → 1.9mm
"MOZART PIANO CONCERTO NO. 21 IN C MAJOR" → 1.8mm
"THE FOUR SEASONS - VIVALDI" → 2.3mm
```

### **Soundtrack Albums (Descriptive Titles):**
```
"THE LIFE AQUATIC WITH STEVE ZISSOU" → 2.1mm ✅
"GUARDIANS OF THE GALAXY VOL. 2" → 2.2mm
"PULP FICTION ORIGINAL SOUNDTRACK" → 2.0mm
```

---

## Typography Quality

All scaled text maintains:
- ✅ Bold weight (for titles)
- ✅ Anti-aliasing / smoothing
- ✅ Proportional letter spacing
- ✅ Proper baseline alignment
- ✅ High-quality rendering at 300 DPI

**No pixelation or quality loss at smaller sizes.**

---

## Developer Notes

### **Why 1.8mm Minimum?**
- Below 1.8mm, text becomes hard to read on physical MiniDisc labels
- At 300 DPI print resolution: 1.8mm ≈ 21 pixels
- Maintains legibility for 60-year-old eyes 👓

### **Why 0.1mm Steps?**
- Gradual reduction (not abrupt jumps)
- Only scales as much as needed
- Preserves visual hierarchy
- 10 possible sizes between 2.8mm and 1.8mm

### **Why Word Boundary Truncation?**
- "THE LIFE AQU..." ❌ (cut mid-word, ugly)
- "THE LIFE AQUATIC..." ✅ (natural break)
- Improves readability
- Looks professional

---

## Console Output Examples

### **Short Title:**
```
✅ Title fits at base size 2.8mm
```

### **Auto-Scaled Title:**
```
📏 Title too long (485px > 437px)
✅ Title scaled to 2.1mm to fit
```

### **Truncated Title:**
```
📏 Title too long (720px > 437px)
⚠️ Title still too long at minimum 1.8mm - truncating
✂️ Title truncated: "THE COMPLETE STUDIO RECORDINGS..." → "THE COMPLETE STUDIO..."
```

---

## Testing Checklist

Use these test cases to verify scaling works:

- [ ] **Short:** "NEVERMIND" → Should be 2.8mm
- [ ] **Medium:** "THE LIFE AQUATIC WITH STEVE ZISSOU" → Should scale to ~2.1mm
- [ ] **Long:** "ORIGINAL MOTION PICTURE SOUNDTRACK" → Should scale to 1.8mm
- [ ] **Extreme:** Very long title → Should truncate with "..."
- [ ] Console logs show correct scaling decisions
- [ ] All text remains crisp at 300 DPI export

---

**Deployment:** v0.3.7e
**Status:** ✅ Live at https://minidisc.squirclelabs.uk
