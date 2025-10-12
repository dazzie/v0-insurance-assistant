# 🚨 MERGE CONFLICT RESOLUTION GUIDE

## Current Situation:
Your `week-4` branch has **extensive merge conflicts** that are preventing the app from compiling.

---

## 🔍 Files with Merge Conflicts:

1. ✅ `components/customer-profile-form.tsx` - **FIXED**
2. ❌ `components/insurance-summary-comparison.tsx` - **BROKEN** (10+ conflicts)
3. ❌ `components/demo-summary.tsx` - **BROKEN** (10+ conflicts)
4. ❌ Possibly more files...

---

## 📋 Resolution Options:

### Option 1: Clean Reset (RECOMMENDED) ⭐

**What it does:** Resets your week-4 branch to a clean state, removing all merge conflict markers.

**Commands:**
```bash
cd /Users/daraghmoran/Documents/maven-agentic/v0-insurance-assistant

# Save your current work (just in case)
git stash

# Reset to the last clean commit
git reset --hard origin/week-4

# OR if you want to keep some changes
git reset --hard HEAD~1

# Restart the dev server
rm -rf .next
npm run dev
```

**Pros:**
- ✅ Clean slate
- ✅ Fast
- ✅ Guaranteed to work

**Cons:**
- ❌ Loses uncommitted changes (but they're saved in stash)

---

### Option 2: Manual Conflict Resolution

**What it does:** Keep the files that work, fix the ones that don't.

**Strategy:**

1. **Keep the fixed files:**
   - `components/customer-profile-form.tsx` ✅ (I already fixed this)
   - `components/coverage-analyzer.tsx` ✅ (Has camera functionality)
   - `components/profile-summary-card.tsx` ✅ (Shows NHTSA details)
   - `app/api/analyze-coverage/route.ts` ✅ (VIN enrichment)

2. **Reset the broken files:**
   ```bash
   # Reset files with merge conflicts to clean versions
   git checkout origin/week-4 -- components/insurance-summary-comparison.tsx
   git checkout origin/week-4 -- components/demo-summary.tsx
   ```

3. **Clear cache and restart:**
   ```bash
   rm -rf .next
   npm run dev
   ```

---

### Option 3: Accept "Theirs" (Origin) for All Conflicts

**What it does:** Automatically resolves ALL conflicts by taking the version from `origin/week-4`.

**Commands:**
```bash
cd /Users/daraghmoran/Documents/maven-agentic/v0-insurance-assistant

# Accept all incoming changes (from origin/week-4)
git checkout --theirs components/insurance-summary-comparison.tsx
git checkout --theirs components/demo-summary.tsx

# Find any other conflicted files
git diff --name-only --diff-filter=U

# Accept theirs for all
git diff --name-only --diff-filter=U | xargs -I {} git checkout --theirs {}

# Clean up markers
git add .

# Restart
rm -rf .next
npm run dev
```

---

## 🎯 What I Recommend:

### Quick Fix (5 minutes):
```bash
# 1. Go to your project
cd /Users/daraghmoran/Documents/maven-agentic/v0-insurance-assistant

# 2. Find all files with conflicts
git status | grep "both modified"

# 3. Reset the problem files
git checkout origin/week-4 -- components/insurance-summary-comparison.tsx
git checkout origin/week-4 -- components/demo-summary.tsx

# 4. Keep my fixes to customer-profile-form.tsx (it's already fixed)

# 5. Clear cache and restart
rm -rf .next
npm run dev
```

---

## ✅ After Resolution - Verify These Features:

Once the app compiles, test:

1. **📸 Camera Functionality**
   - Go to homepage
   - Look for "Upload Current Auto Insurance Policy"
   - Click "Take Photo" button
   - Camera should open

2. **🚗 NHTSA VIN Enrichment**
   - Upload a policy image with VIN
   - Profile should show full vehicle details
   - Look for "✓ NHTSA Registry" badge

3. **📋 Profile Display**
   - Vehicle specs should show:
     - Make, Model, Year
     - Body Class, Fuel Type
     - Manufacturer, Plant location
     - Safety features (ABS, ESC)

---

## 🆘 If Still Not Working:

**Nuclear Option - Complete Fresh Start:**

```bash
# 1. Commit or stash everything
git add .
git commit -m "WIP: Week 4 features" || git stash

# 2. Get a clean version
git fetch origin
git reset --hard origin/week-4

# 3. Reapply ONLY the critical files
# (I can provide clean versions of all week-4 files)

# 4. Restart
rm -rf .next node_modules/.cache
npm run dev
```

---

## 📞 Current Status:

- ✅ `customer-profile-form.tsx` - Fixed (no more merge conflicts)
- ✅ Week-4 features coded properly
- ❌ 2-3 files still have `<<<<<<<` merge markers
- ❌ App won't compile until conflicts resolved

---

## 🚀 The Goal:

Get to a clean state where:
1. No merge conflict markers in any file
2. App compiles successfully
3. Camera + NHTSA features work
4. Ready to test and demo

**Would you like me to:**
1. Execute Option 3 (reset the broken files)?
2. Provide clean versions of all affected files?
3. Something else?

