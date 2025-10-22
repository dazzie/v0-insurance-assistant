# 🚀 Vercel Deployment Guide

## Prerequisites

1. **GitHub Account** (you already have this)
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier is perfect)
3. **Environment Variables** - Your API keys

---

## 📋 Step-by-Step Deployment

### **Step 1: Push Your Code to GitHub**

Your code is already on GitHub in the `agentic-features` branch. You can deploy from this branch or merge to `main` first.

```bash
# Option A: Deploy from current branch (agentic-features)
git push origin agentic-features

# Option B: Merge to main first (recommended for production)
git checkout main
git merge agentic-features
git push origin main
```

---

### **Step 2: Connect to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"** (use GitHub login for easiest setup)
3. Click **"Add New Project"**
4. **Import** your GitHub repository: `v0-insurance-assistant`
5. Vercel will auto-detect it's a Next.js app ✅

---

### **Step 3: Configure Environment Variables**

In the Vercel project settings, add these environment variables:

#### **Required:**
```
OPENAI_API_KEY=sk-proj-...your-key...
```

#### **Optional (for MCP enrichment):**
```
NHTSA_API_KEY=not_required
OPENCAGE_API_KEY=your-opencage-key
HUNTER_API_KEY=your-hunter-key
FIRSTSTREET_API_KEY=your-firststreet-key
```

#### **How to Add in Vercel:**
1. In your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-...`
   - **Environments**: Check all (Production, Preview, Development)
4. Click **"Save"**

---

### **Step 4: Deploy**

1. Click **"Deploy"** in Vercel
2. Wait 2-3 minutes for the build
3. You'll get a live URL like: `https://v0-insurance-assistant.vercel.app`

---

## 🔧 Post-Deployment Configuration

### **MCP Servers**

⚠️ **Important:** MCP servers run as local processes and **won't work in Vercel's serverless environment**.

**Options:**

1. **Convert to API Routes** (Recommended for production)
   - Move MCP server logic into Next.js API routes
   - Example: `/api/nhtsa-vin-decode`, `/api/opencage-geocode`

2. **Use External Services**
   - Deploy MCP servers to Railway/Render/Fly.io
   - Call them via HTTP from your Vercel app

3. **Disable for Production** (Quick fix)
   - The app will work without MCP enrichment
   - Users just won't get VIN/address/email verification badges

---

## 📊 Monitoring & Logs

- **Vercel Dashboard**: Real-time logs and analytics
- **Vercel Analytics**: Automatically enabled (free)
- **Error Tracking**: Built-in error reporting

---

## 🔄 Continuous Deployment

Once connected, Vercel will **automatically deploy**:
- ✅ Every push to `main` → Production
- ✅ Every pull request → Preview deployment
- ✅ Every push to other branches → Preview deployment

---

## 🌐 Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `insurance-coach.com`)
3. Update DNS records as instructed
4. SSL certificate is automatic ✅

---

## 🐛 Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all dependencies are in `package.json`
- Ensure `.env.local` variables are added to Vercel

### MCP Servers Not Working
- Expected in serverless environment
- See "Post-Deployment Configuration" above

### API Rate Limits
- OpenAI: Monitor usage in OpenAI dashboard
- Consider implementing rate limiting for production

---

## 📈 Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] Production build tested locally (`npm run build`)
- [ ] API keys secured (never commit to git)
- [ ] Error boundaries in place
- [ ] Analytics enabled
- [ ] Custom domain configured (optional)
- [ ] MCP servers converted to API routes or disabled

---

## 🎯 Quick Deploy Commands

```bash
# Ensure you're on the right branch
git status

# Push to GitHub
git push origin agentic-features

# Then deploy via Vercel dashboard or CLI:
npx vercel --prod
```

---

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Vercel Discord**: [vercel.com/discord](https://vercel.com/discord)

---

## 🎉 Success!

Once deployed, your app will be live at:
```
https://your-project-name.vercel.app
```

Share this URL with users and start collecting feedback! 🚀
