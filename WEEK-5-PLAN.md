# Week 5 Development Plan

**Branch:** `week-5`  
**Base:** `main` (commit 6172956)  
**Created:** October 13, 2025

---

## ✅ Starting Point - Main Branch Status

### **Working Features:**
- ✅ Next.js 14.2.33 with Tailwind CSS v4
- ✅ Policy scanning with OpenAI Vision (GPT-4o)
- ✅ NHTSA VIN decoder MCP server (vehicle enrichment)
- ✅ OpenCage Geocoding MCP server (address verification)
- ✅ Hunter.io Email Verification MCP server (email validation)
- ✅ Smart profile merging (protects enriched data from being overwritten)
- ✅ LocalStorage persistence
- ✅ Coverage analyzer with camera capture
- ✅ Chat interface with conversation flow
- ✅ Quote comparison generator

### **Recent Fixes:**
- 🔧 Restored `formatted-response.tsx` (was empty 0 byte file)
- 🔧 Fixed merge conflicts in multiple components
- 🔧 Resolved Tailwind CSS v3/v4 configuration issues

---

## 🎯 Week 5 Goals

### **Priority 1: Session Storage & Data Management**
- [ ] Switch from `localStorage` to `sessionStorage` for profile data
- [ ] Add "Clear Session" button to header
- [ ] Ensure enriched data (NHTSA, OpenCage, Hunter.io) persists correctly

### **Priority 2: Testing & Validation**
- [ ] Test full policy scan → enrichment → conversation flow
- [ ] Verify NHTSA enrichment persists through entire conversation
- [ ] Verify OpenCage enrichment persists through entire conversation
- [ ] Verify Hunter.io enrichment triggers correctly

### **Priority 3: UI/UX Improvements**
- [ ] Ensure enrichment badges (✓ NHTSA Registry, ✓ OpenCage Verified) always display
- [ ] Fix any "profile blown away" issues after responses
- [ ] Improve mobile responsiveness
- [ ] Add loading states and animations

### **Priority 4: Code Quality**
- [ ] Clean up console logs
- [ ] Remove duplicate/backup files
- [ ] Update `.gitignore` to exclude common junk files
- [ ] Add comprehensive error handling

---

## 📋 Known Issues to Address

### **High Priority:**
1. **Profile persistence after conversation** - Need to verify enriched data doesn't get overwritten
2. **Session vs Local storage** - User requested session-based storage (clears when tab closes)
3. **ZIP code truncation** - OpenCage verified addresses sometimes lose ZIP+4

### **Medium Priority:**
1. **Driver age validation** - Policy scan extracted driver age as 3 years old (data quality issue)
2. **Email verification timing** - Hunter.io should only trigger when email is collected
3. **Prompt mismatch warnings** - Suggested prompts not always matching AI questions

### **Low Priority:**
1. **Next.js version outdated** - Consider upgrading to latest Next.js 15
2. **Static asset 404s** - Some CSS/JS bundles showing 404 (browser cache issue)
3. **Console warnings** - React ref warnings on Button components

---

## 🚀 Development Workflow

### **Branch Strategy:**
- `main` - Stable, production-ready code
- `week-5` - Active development branch for Week 5 features
- Merge to `main` only when fully tested and working

### **Testing Checklist:**
Before merging to `main`, verify:
- [ ] Policy scan extracts all fields correctly
- [ ] NHTSA enrichment works and persists
- [ ] OpenCage enrichment works and persists
- [ ] Hunter.io enrichment triggers correctly
- [ ] Profile data survives entire conversation flow
- [ ] No console errors or warnings
- [ ] Mobile layout works correctly
- [ ] All enrichment badges display correctly

---

## 📊 Technical Debt

### **To Clean Up:**
- Remove `route 2.ts`, `route-backup.ts`, `route-with-rag.ts` from `app/api/chat/`
- Remove `postcss.config.js` (keeping only `.mjs` version)
- Remove `styles/globals.css` (keeping only `app/globals.css`)
- Update `.gitignore` to exclude `*2.*`, `*3.*`, etc.

### **To Document:**
- MCP server setup instructions
- API key requirements (OpenAI, OpenCage, Hunter.io, NHTSA)
- Environment variable configuration
- Deployment instructions

---

## 📝 Notes

- Server running on port 3000
- MCP servers in `mcp-server/` directory
- All enrichment logic in `app/api/analyze-coverage/route.ts`
- Profile management in `lib/customer-profile.ts`
- Smart merge logic protects enriched fields from being overwritten

---

**Last Updated:** October 13, 2025  
**Status:** ✅ Clean slate, ready for development

