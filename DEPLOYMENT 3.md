# Deployment Guide - Personal Insurance Coverage Coach

This guide will help you deploy your insurance assistant application to production.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

Vercel is the easiest way to deploy Next.js applications.

#### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Environment variables ready

#### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings:
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Set Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   VECTORIZE_IO_API_KEY=your_vectorize_api_key_here
   VECTORIZE_IO_PIPELINE_ID=your_pipeline_id_here
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `https://your-project.vercel.app`

#### Custom Domain (Optional)
- Settings → Domains → Add your custom domain
- Update DNS records as instructed

---

### Option 2: Netlify

#### Steps:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   netlify login
   netlify init
   netlify deploy --prod
   ```

3. **Environment Variables**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add the same variables as above

---

### Option 3: Docker + Any Cloud Provider

#### Create Dockerfile:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Deploy to:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**

---

## 📋 Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o Vision text extraction | Yes |
| `VECTORIZE_IO_API_KEY` | Vectorize.io API key for insurance knowledge base | Yes |
| `VECTORIZE_IO_PIPELINE_ID` | Vectorize.io pipeline ID | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional, if using Claude) | No |

---

## 🔒 Security Checklist

Before deploying, ensure:

- [ ] All API keys are stored as environment variables (not in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] HTTPS is enabled (automatic with Vercel/Netlify)
- [ ] CORS is properly configured for your domain
- [ ] Rate limiting is in place for API routes
- [ ] Input validation is implemented

---

## 🧪 Testing Production Build Locally

Test your production build before deploying:

```bash
# Build for production
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

---

## 📱 Mobile Considerations

### Camera Permissions
- Camera access requires HTTPS in production
- Test camera functionality after deployment
- Provide clear permission request messages

### Performance
- Images are optimized with Next.js Image component
- Lazy loading is enabled for better mobile performance
- Responsive design adapts to all screen sizes

---

## 🔄 Continuous Deployment

### Vercel (Automatic)
- Push to `main` branch → auto-deploys to production
- Push to other branches → creates preview deployments

### GitHub Actions (Manual Setup)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test # if you have tests
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Verify all dependencies are installed
- Check for TypeScript errors: `npm run type-check`

### API Routes Not Working
- Verify environment variables are set
- Check API route paths are correct
- Look at server logs for errors

### Camera Not Working
- Ensure HTTPS is enabled
- Check browser console for permission errors
- Test on different devices/browsers

### Slow Performance
- Enable Next.js image optimization
- Check bundle size: `npm run analyze`
- Use CDN for static assets

---

## 📊 Monitoring

### Vercel Analytics
- Automatic with Vercel deployment
- Real-time performance metrics
- Web Vitals monitoring

### Custom Monitoring
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage metrics

---

## 🚀 Post-Deployment

1. **Test Core Features**
   - [ ] Customer profile form
   - [ ] Chat interface
   - [ ] Policy scanner (mobile camera)
   - [ ] Quote generation
   - [ ] Coverage analyzer

2. **Monitor Performance**
   - Check loading times
   - Monitor API response times
   - Watch error rates

3. **Gather Feedback**
   - Test on multiple devices
   - Get user feedback
   - Iterate and improve

---

## 📞 Support

For deployment issues:
- Next.js Docs: https://nextjs.org/docs/deployment
- Vercel Support: https://vercel.com/support
- GitHub Issues: Create an issue in your repository

---

## 🎉 You're Ready to Deploy!

Your insurance assistant is production-ready with:
- ✅ Mobile-optimized UI
- ✅ Camera-based policy scanning
- ✅ AI-powered insurance advice
- ✅ Real-time profile management
- ✅ Quote comparison system

Choose your deployment platform and follow the steps above. Good luck! 🚀

