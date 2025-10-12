# 🔄 RESTART INSTRUCTIONS - Clear Cache & Fix Build

## ⚠️ Current Issue:
Next.js is caching an old broken version of `customer-profile-form.tsx` even though the file is actually fixed.

---

## ✅ File Status (VERIFIED):
```bash
$ grep -n "useState<Record<string, string>>" components/customer-profile-form.tsx
21:  const [errors, setErrors] = useState<Record<string, string>>({})
```

**The file IS CORRECT** - only 2 closing `>` brackets (not 3)

---

## 🛠️ MANUAL RESTART STEPS:

### Step 1: Stop the Dev Server
In your terminal where `npm run dev` is running:
- Press `Ctrl + C` to stop the server
- Wait for it to fully stop

### Step 2: Clear Next.js Cache
```bash
cd /Users/daraghmoran/Documents/maven-agentic/v0-insurance-assistant
rm -rf .next
```

If that fails, try:
```bash
sudo rm -rf .next
```

### Step 3: Clear Node Modules Cache (Optional but Recommended)
```bash
rm -rf node_modules/.cache
```

### Step 4: Restart the Dev Server
```bash
npm run dev
```

### Step 5: Hard Refresh Browser
- **Mac:** `Cmd + Shift + R`
- **Windows/Linux:** `Ctrl + Shift + R`

---

## 🚀 Alternative: Nuclear Option

If the above doesn't work, do a complete reset:

```bash
# Stop the server (Ctrl+C)

# Remove all cache and build artifacts
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# Reinstall dependencies (optional, only if still failing)
# rm -rf node_modules
# npm install

# Restart
npm run dev
```

---

## 📊 What to Expect After Restart:

You should see:
```
✓ Ready in 2.5s
○ Compiling / ...
✓ Compiled / in 3.2s
```

Then in browser:
- ✅ No more syntax errors
- ✅ App loads successfully
- ✅ Camera + Upload buttons visible
- ✅ All features working

---

## 🎯 Week-4 Features Ready to Test:

Once restarted, you'll have:

1. **📸 Camera Photo Capture**
   - "Take Photo" button
   - Live video preview
   - Auto-analysis after capture

2. **🚗 NHTSA VIN Enrichment**
   - Automatic VIN lookup
   - 20+ vehicle fields enriched
   - "✓ NHTSA Registry" badge

3. **📋 Enhanced Profile Display**
   - Full vehicle specifications
   - Manufacturing details
   - Safety features
   - Registry indicator

4. **📱 Responsive Design**
   - Mobile-optimized
   - Side-by-side buttons on desktop
   - Stacked on mobile

---

## 🐛 If Still Not Working:

### Check File Integrity:
```bash
# Verify the file is correct
grep -n ">>>(" components/customer-profile-form.tsx
```

Should return **nothing** (no matches).

If you see matches, the file has reverted. Let me know!

### Check for Hidden Characters:
```bash
hexdump -C components/customer-profile-form.tsx | grep -A2 -B2 "useState"
```

### Last Resort - Restore from Backup:
I can regenerate the entire file cleanly if needed.

---

## ✅ Expected Result:

After restart, line 21 should compile cleanly:
```typescript
const [errors, setErrors] = useState<Record<string, string>>({})
                                                           ^^
                                                  Only 2 brackets ✓
```

---

## 📞 Status Check:

After restarting, check:
- ✅ Terminal shows "✓ Compiled successfully"
- ✅ Browser shows no build errors
- ✅ App homepage loads
- ✅ Coverage Analyzer shows "Take Photo" + "Upload File"

---

**Once you complete these steps, the app will work!** 🎉

The fix is already in the file - we just need to clear the cache so Next.js picks it up.

