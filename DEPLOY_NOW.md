# 🚀 DEPLOY NOW - Complete CLI Guide
## Mohawk Medibles AI Directory - Production Deployment

**Quick Deploy**: Run `./scripts/setup-all.sh` for interactive setup

---

## ⚡ OPTION 1: Quick Deploy (Recommended)

```bash
cd ~/MohawkMedibles_SEO_v1.0

# Run interactive setup
./scripts/setup-all.sh
```

This will:
1. ✅ Install all dependencies
2. ✅ Set up database
3. ✅ Seed 23 cities + sample data
4. ✅ Build the application
5. 🚀 Deploy to your choice of platform

---

## 📋 OPTION 2: Manual Step-by-Step

### Prerequisites

```bash
# Check you have these installed
node --version      # Should be v18+
npm --version       # Should be v9+
vercel --version    # Install: npm i -g vercel
gcloud --version    # Install: https://cloud.google.com/sdk/docs/install
docker --version    # For GCP deployment
```

---

## 🌐 DEPLOY TO VERCEL (Frontend + Edge)

### Step 1: Login to Vercel

```bash
# Login (opens browser)
vercel login

# Verify login
vercel whoami
```

### Step 2: Set Environment Variables

```bash
# Link your project
vercel link

# Set secrets
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
vercel env add PERPLEXITY_API_KEY
vercel env add NEXT_PUBLIC_APP_URL

# Or edit .env and pull
vercel env pull .env.local
```

### Step 3: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 4: Configure Domain

```bash
# Add custom domain
vercel domains add mohawkmedibles.ca

# Or in Vercel Dashboard:
# Settings → Domains → Add Domain
```

### Step 5: Set Up Cron Jobs

In Vercel Dashboard:
1. Go to your project
2. Settings → Cron Jobs
3. Add:
   - `/api/cron/ai-automation` - Schedule: `0 */6 * * *`
   - `/api/cron/seo-optimization` - Schedule: `0 2 * * *`

---

## ☁️ DEPLOY TO GOOGLE CLOUD (Full AI Power)

### Step 1: Authenticate

```bash
# Login to GCP
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Verify
gcloud config get-value project
```

### Step 2: Enable APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 3: Create Secrets

```bash
# Create secrets in Secret Manager
echo -n "your-database-url" | gcloud secrets create database-url --data-file=-
echo -n "your-openai-key" | gcloud secrets create openai-api-key --data-file=-
echo -n "your-perplexity-key" | gcloud secrets create perplexity-api-key --data-file=-
```

### Step 4: Deploy

```bash
# Use our deployment script
./scripts/deploy-gcp.sh

# Or manually:
gcloud builds submit --config cloudbuild.yaml
```

### Step 5: Configure Domain

```bash
# Map custom domain
gcloud run domain-mappings create --service mohawk-medibles --domain mohawkmedibles.ca --region us-central1
```

---

## 🔥 OPTION 3: Deploy to Both (Recommended for Production)

```bash
# Deploy to Vercel for global CDN
./scripts/deploy-vercel.sh

# Deploy to GCP for AI processing
./scripts/deploy-gcp.sh

# Configure:
# - Vercel: Primary frontend (mohawkmedibles.ca)
# - GCP: API and AI processing (api.mohawkmedibles.ca)
```

---

## 🔧 Environment Variables Required

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# AI Services
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
PERPLEXITY_API_KEY="pplx-xxxxxxxxxxxxxxxxxx"

# Application
NEXT_PUBLIC_APP_URL="https://mohawkmedibles.ca"
NODE_ENV="production"

# Optional: Email
RESEND_API_KEY="re_xxxxxxxx"

# Optional: Payments
STRIPE_SECRET_KEY="sk_live_xxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_live_xxxxxxxx"
```

---

## 📊 Post-Deployment Checklist

### Immediate (First Hour)

- [ ] Verify site loads at your domain
- [ ] Check `/directory` page works
- [ ] Test API endpoints:
  ```bash
  curl https://your-domain.com/api/directory/cities
  ```
- [ ] Verify database connection
- [ ] Check AI agents can run

### First Day

- [ ] Run initial AI content generation
- [ ] Verify 23 city pages are created
- [ ] Check Google indexing
- [ ] Set up Google Search Console
- [ ] Submit sitemap

### First Week

- [ ] Monitor AI automation logs
- [ ] Check SEO rankings
- [ ] Verify cron jobs running
- [ ] Monitor performance metrics
- [ ] Set up alerts

---

## 🚨 Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull

# Check connection string format
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### Build Failures

```bash
# Clear cache
rm -rf .next node_modules
npm ci
npm run build
```

### AI Agent Not Running

```bash
# Check Python dependencies
pip3 install aiohttp requests

# Run manually to see errors
python3 agents/directory_ai_agent.py
```

### Vercel Deployment Fails

```bash
# Check logs
vercel logs --all

# Redeploy
vercel --force
```

### GCP Deployment Fails

```bash
# Check build logs
gcloud builds list
gcloud builds log BUILD_ID

# Check service logs
gcloud logging tail --service=mohawk-medibles
```

---

## 💰 Cost Estimates

### Vercel (Pro Plan)
- **$20/month** - Base plan
- **Bandwidth**: Included up to 1TB
- **Builds**: Included

### Google Cloud Run
- **~$50-100/month** - 2Gi RAM, 2 CPU
- **Storage**: ~$5/month
- **Builds**: ~$10/month

### OpenAI API
- **~$50-200/month** - Depends on usage
- GPT-4 content generation

### Perplexity API
- **~$20-50/month** - Directory discovery

**Total: ~$150-400/month** for full production setup

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server

# Database
npx prisma studio              # Open DB GUI
npx prisma db push             # Push schema
npx prisma migrate dev         # Run migrations

# AI Agents
python3 agents/directory_ai_agent.py
python3 agents/aeo_llm_agent.py

# Deployment
./scripts/deploy-vercel.sh     # Deploy to Vercel
./scripts/deploy-gcp.sh        # Deploy to GCP
./scripts/setup-all.sh         # Interactive setup

# Monitoring
vercel logs                    # Vercel logs
gcloud logging tail            # GCP logs
```

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **GCP Cloud Run**: https://cloud.google.com/run/docs
- **Prisma**: https://www.prisma.io/docs
- **Next.js**: https://nextjs.org/docs

---

## 🎉 You're Ready to Launch!

Your AI-powered cannabis directory will:
- ✅ Serve 23 Canadian cities
- ✅ Auto-generate content 24/7
- ✅ Rank on Google & LLMs
- ✅ Highlight Indigenous businesses
- ✅ Scale automatically

**Deploy now and dominate the market!** 🚀

```bash
# ONE COMMAND TO RULE THEM ALL:
./scripts/setup-all.sh
```
