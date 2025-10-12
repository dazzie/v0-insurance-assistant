# OpenCage Badge Disappearing - Fixed ✅

## Problem
The "✓ OpenCage Verified" badge was appearing after policy scan but **disappearing after the user answered the next question**. The ZIP code also changed from `94122-3045` to `94122`.

## Root Cause
The `extractProfileFromConversation()` function in `lib/customer-profile.ts` was extracting ZIP codes from conversation messages using this regex:

```typescript
const zipMatch = content.match(/\b(\d{5})\b/)
if (zipMatch && !extracted.zipCode) {
  extracted.zipCode = zipMatch[1]
}
```

### The Issue:
1. This regex only captures **5 digits** (e.g., `94122` instead of `94122-3045`)
2. It did **not check** if the address was already enriched by OpenCage
3. When the user answered questions, the conversation would extract a 5-digit ZIP
4. This overwrote the enriched ZIP code (with the -3045 extension)
5. The `addressEnrichment` object was lost during the merge

## The Fix

### File: `lib/customer-profile.ts`

#### Line 352: Added Enriched Address Check
```typescript
const hasEnrichedAddress = currentProfile?.addressEnrichment?.enriched
```

#### Line 367: Skip ZIP Extraction if Address is Enriched
```typescript
// Extract ZIP code - skip if address is already enriched by OpenCage
const zipMatch = content.match(/\b(\d{5})\b/)
if (zipMatch && !extracted.zipCode && !hasEnrichedAddress) {
  extracted.zipCode = zipMatch[1]
}
```

## Protection Layers
The fix adds a **third layer** of protection, matching the NHTSA vehicle protection pattern:

### Layer 1: Skip Extraction (NEW)
`extractProfileFromConversation()` now checks `hasEnrichedAddress` before extracting ZIP codes from conversation.

### Layer 2: Block Updates
`updateProfile()` blocks address, city, state, and zipCode updates if `addressEnrichment.enriched` is true.

### Layer 3: Preserve Enrichment
`updateProfile()` explicitly preserves the `addressEnrichment` object during merges.

## Expected Behavior

### ✅ After Fix:
- Badge shows: **✓ OpenCage Verified**
- ZIP stays: **94122-3045** (full ZIP+4)
- Address remains: **1847 14th Avenue, San Francisco, CA 94122, United States of America**
- **Badge persists** throughout the conversation
- No overwrites from conversation extraction

### ❌ Before Fix:
- Badge appeared initially
- Badge disappeared after next question
- ZIP changed from `94122-3045` → `94122`
- Address enrichment was lost

## Testing Instructions

1. **Clear localStorage**: Open DevTools Console and run `localStorage.clear()`
2. **Refresh the page**
3. **Upload policy document** (camera or file upload)
4. **Verify badge appears**: Look for "✓ OpenCage Verified" in Property Information
5. **Answer the next question** (e.g., "How many drivers?")
6. **Verify badge persists**: Badge should still be visible
7. **Check ZIP code**: Should show `94122-3045` not `94122`

## Files Modified
- `lib/customer-profile.ts` (lines 352, 367)
- `components/profile-summary-card.tsx` (removed debug logging)

## Impact
This fix ensures that OpenCage-verified addresses remain protected and visible throughout the entire conversation, just like NHTSA-enriched vehicle data. Users can now trust that their verified address data won't be corrupted by subsequent conversation extractions.

---

**Status**: ✅ Fixed and Ready to Test  
**Date**: October 12, 2025  
**Related**: NHTSA vehicle protection, OPENCAGE-INTEGRATION.md

