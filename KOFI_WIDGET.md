# Ko-fi Widget Replacement

**Date:** 2026-02-07  
**Commit:** da81913

---

## Changes Made

### 1. Removed Static Ko-fi Buttons

**Removed from Header:**
- Large Ko-fi button with coffee cup + red heart icon
- Located in top-right header area

**Removed from Info Box:**
- Ko-fi button at bottom of left sidebar info panel
- Below version number display

### 2. Created KofiWidget Component

**File:** `app/components/KofiWidget.tsx`

- Client-side component using Next.js `Script` component
- Loads Ko-fi floating chat widget script
- Configuration:
  - Type: `floating-chat`
  - Username: `joltt`
  - Button text: "Support Me"
  - Button color: `#00b9fe` (bright blue)
  - Text color: `#fff` (white)

### 3. Integrated Widget into Page

**File:** `app/page.tsx`

- Imported `KofiWidget` component
- Wrapped entire page with React Fragment (`<>`)
- Added `<KofiWidget />` at the top level
- Widget appears as floating button in bottom-right corner

---

## User Experience

**Before:**
- Two static Ko-fi buttons taking up UI space
- One in header, one in sidebar
- Required clicks to navigate away from app

**After:**
- Floating chat widget in bottom-right corner
- Stays visible while scrolling
- Non-intrusive, collapsible
- Allows donations without leaving the app

---

## Technical Details

- Widget loads lazily (`strategy="lazyOnload"`)
- Minimal performance impact
- Initializes on script load
- Uses Ko-fi's official overlay widget
- Compatible with both light and dark themes

---

## Testing

1. Visit https://minidisc.squirclelabs.uk
2. Look for floating button in bottom-right corner
3. Click to open Ko-fi chat widget
4. Verify donation flow works
5. Confirm widget is visible on all pages/scroll positions

---

## Ko-fi Configuration

Current settings:
- **Username:** joltt
- **Type:** Floating chat widget
- **Button text:** "Support Me"
- **Colors:** Blue background (#00b9fe), white text

Can be modified in: `app/components/KofiWidget.tsx`
