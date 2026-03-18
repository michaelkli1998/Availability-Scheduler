# Deployment Guide

This guide covers deploying the Availability Scheduler app to production.

## Prerequisites

Before deploying:

- ✅ Firebase project set up with Firestore enabled
- ✅ Environment variables configured
- ✅ Application tested locally
- ✅ Code pushed to a Git repository (GitHub, GitLab, etc.)

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications and is made by the creators of Next.js.

### Step 1: Prepare Your Repository

1. Push your code to GitHub:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Make sure `.env.local` is in `.gitignore` (it should be by default)

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Authorize Vercel to access your repositories

### Step 3: Import Project

1. Click "Add New..." → "Project"
2. Select your `availability-scheduler` repository
3. Vercel will automatically detect it's a Next.js project

### Step 4: Configure Environment Variables

1. In the "Configure Project" section, expand **Environment Variables**
2. Add each Firebase variable:

```
NEXT_PUBLIC_FIREBASE_API_KEY = your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = your_app_id
```

3. Select all environments: Production, Preview, Development

### Step 5: Deploy

1. Click "Deploy"
2. Wait for the build to complete (1-2 minutes)
3. Once deployed, you'll get a production URL like: `https://your-app.vercel.app`

### Step 6: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS
4. SSL certificate is automatically provisioned

### Continuous Deployment

Vercel automatically:
- Deploys `main` branch to production
- Creates preview deployments for pull requests
- Runs builds on every push

## Option 2: Deploy to Netlify

### Step 1: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Authorize Netlify

### Step 2: Create New Site

1. Click "Add new site" → "Import an existing project"
2. Choose GitHub and select your repository
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

### Step 3: Environment Variables

1. Go to Site settings → Environment variables
2. Add all Firebase environment variables

### Step 4: Deploy

1. Click "Deploy site"
2. Wait for build to complete
3. Get your production URL

## Option 3: Deploy to Railway

Railway is great for full-stack apps with database connections.

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project

### Step 2: Deploy from GitHub

1. Click "Deploy from GitHub repo"
2. Select your repository
3. Railway auto-detects Next.js

### Step 3: Environment Variables

1. Go to project → Variables
2. Add all Firebase variables

### Step 4: Deploy

1. Railway automatically deploys
2. Get your production URL from the deployment

## Option 4: Self-Hosted (Docker)

### Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID

ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

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

### Deploy with Docker

```bash
# Build
docker build -t availability-scheduler \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=your_key \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain \
  # ... other args
  .

# Run
docker run -p 3000:3000 availability-scheduler
```

## Post-Deployment Checklist

After deploying to any platform:

### 1. Update Firebase Configuration

In Firebase Console:

1. Go to **Project Settings** → **Authorized domains**
2. Add your production domain (e.g., `your-app.vercel.app`)
3. Add any preview domains if using Vercel

### 2. Test Production Deployment

- ✅ Visit your production URL
- ✅ Create a test event
- ✅ Submit availability as a participant
- ✅ Verify heatmap displays correctly
- ✅ Check real-time updates work
- ✅ Test on mobile devices
- ✅ Test sharing links

### 3. Monitor Performance

#### Vercel Analytics (Free)

1. Go to your project → Analytics
2. View:
   - Page views
   - Top pages
   - Top referrers
   - Visitor insights

#### Firebase Console

1. Monitor Firestore usage:
   - Reads/writes per day
   - Storage usage
   - Active connections

### 4. Set Up Error Monitoring (Optional)

#### Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Then add to `next.config.js` and environment variables.

#### Vercel Error Tracking

Built-in error tracking available in Vercel dashboard.

## Environment-Specific Configuration

### Production vs Development

You can use different Firebase projects for production and development:

**Development (.env.local):**
```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-app-dev
```

**Production (Vercel/Netlify):**
```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-app-prod
```

### Feature Flags

Add environment variable for feature toggles:

```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS=false
```

## Scaling Considerations

### Firestore Optimization

1. **Add Indexes**: Monitor Firestore and add suggested indexes
2. **Implement Pagination**: For events with many participants
3. **Cache Data**: Use React Query or SWR for client-side caching

### CDN & Caching

Vercel automatically provides:
- Global CDN for static assets
- Edge caching for API routes
- Automatic image optimization

### Monitoring

Set up alerts for:
- Error rate > 5%
- Response time > 2 seconds
- Firestore quota usage > 80%

## Troubleshooting Deployment Issues

### Build Failures

**Error: "Module not found"**
```bash
# Solution: Clear cache and reinstall
npm ci
npm run build
```

**Error: "Type errors"**
```bash
# Solution: Fix TypeScript errors locally first
npm run build
```

### Runtime Errors

**Error: "Firebase not initialized"**
- Check environment variables are set correctly
- Verify all `NEXT_PUBLIC_` prefixes are present

**Error: "CORS issues"**
- Add your domain to Firebase authorized domains
- Check Firestore security rules

### Performance Issues

**Slow page loads**
- Enable Vercel Analytics to identify bottlenecks
- Optimize images with Next.js Image component
- Implement code splitting

**High Firestore costs**
- Implement client-side caching
- Reduce real-time listener subscriptions
- Use batched writes

## CI/CD Pipeline (Advanced)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test # if you have tests
```

Vercel/Netlify will automatically deploy after tests pass.

## Rollback Strategy

If something goes wrong:

### Vercel
1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### Netlify
1. Go to Deploys
2. Find last working deploy
3. Click "Publish deploy"

## Next Steps

After successful deployment:

1. 📊 Set up analytics and monitoring
2. 🔒 Implement rate limiting
3. 📧 Add email notifications (optional)
4. 🌐 Set up custom domain
5. 📱 Create PWA manifest for mobile
6. 🔍 Add SEO metadata
7. 🧪 Set up automated testing

---

Questions? Check the [main README](./README.md) or [Firebase setup guide](./FIREBASE_SETUP.md).
