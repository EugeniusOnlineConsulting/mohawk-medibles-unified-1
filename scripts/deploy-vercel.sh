#!/bin/bash
#
# Vercel Deployment Script for Mohawk Medibles AI Directory
# Usage: ./scripts/deploy-vercel.sh [production|preview]
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT="${1:-production}"

echo "🚀 Mohawk Medibles - Vercel Deployment"
echo "======================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel@latest
fi

# Check if logged in
echo "${BLUE}Checking Vercel login status...${NC}"
if ! vercel whoami &> /dev/null; then
    echo "${YELLOW}Please login to Vercel:${NC}"
    vercel login
fi

# Pull environment variables
echo ""
echo "${BLUE}Pulling environment variables...${NC}"
vercel env pull .env.local

# Install dependencies
echo ""
echo "${BLUE}Installing dependencies...${NC}"
npm ci

# Generate Prisma client
echo ""
echo "${BLUE}Generating Prisma client...${NC}"
npx prisma generate

# Build the application
echo ""
echo "${BLUE}Building application...${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
    vercel build --prod
else
    vercel build
fi

# Deploy
echo ""
echo "${BLUE}Deploying to Vercel ($ENVIRONMENT)...${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
    DEPLOYMENT_URL=$(vercel --prod)
else
    DEPLOYMENT_URL=$(vercel)
fi

echo ""
echo "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "🌐 Deployment URL: $DEPLOYMENT_URL"
echo ""

# Set up cron jobs
echo "${BLUE}Setting up cron jobs...${NC}"
echo "${YELLOW}Note: Cron jobs need to be configured in Vercel Dashboard${NC}"
echo "${YELLOW}Go to: https://vercel.com/dashboard → Project → Settings → Cron Jobs${NC}"
echo ""
echo "Add these cron jobs:"
echo "  - Path: /api/cron/ai-automation"
echo "  - Schedule: 0 */6 * * * (Every 6 hours)"
echo "  - Path: /api/cron/seo-optimization"  
echo "  - Schedule: 0 2 * * * (Daily at 2 AM)"
echo ""

# Verify deployment
echo "${BLUE}Verifying deployment...${NC}"
sleep 5

if curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" | grep -q "200"; then
    echo "${GREEN}✅ Site is live and responding!${NC}"
else
    echo "${YELLOW}⚠️  Site may still be starting up. Check manually in a moment.${NC}"
fi

echo ""
echo "${GREEN}🎉 Deployment successful!${NC}"
echo ""
echo "Next steps:"
echo "1. Configure custom domain in Vercel Dashboard"
echo "2. Set up environment variables"
echo "3. Configure cron jobs"
echo "4. Run AI agents: python3 agents/directory_ai_agent.py"
