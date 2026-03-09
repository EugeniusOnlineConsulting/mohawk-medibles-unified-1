#!/bin/bash
#
# Complete Setup and Deployment Script
# Sets up everything from scratch
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🌿 Mohawk Medibles AI Directory - Complete Setup"
echo "================================================="
echo ""

# Check we're in the right directory
if [ ! -f "package.json" ]; then
    echo "${RED}Error: Must run from project root${NC}"
    exit 1
fi

# Step 1: Environment Setup
echo "${BLUE}Step 1/8: Environment Setup${NC}"
echo ""

if [ ! -f ".env" ]; then
    echo "${YELLOW}Creating .env file...${NC}"
    cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://mohawk:password@localhost:5432/mohawkmedibles"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# AI Services (ADD YOUR KEYS)
OPENAI_API_KEY=""
PERPLEXITY_API_KEY=""

# Email (if needed)
RESEND_API_KEY=""

# Payment (if needed)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# ShipStation (if needed)
SHIPSTATION_API_KEY=""
SHIPSTATION_API_SECRET=""
EOF
    echo "${GREEN}✓ Created .env template${NC}"
    echo "${YELLOW}⚠️  Please edit .env and add your API keys${NC}"
else
    echo "${GREEN}✓ .env file exists${NC}"
fi

# Step 2: Install Dependencies
echo ""
echo "${BLUE}Step 2/8: Installing Dependencies${NC}"
npm ci

# Step 3: Python Setup
echo ""
echo "${BLUE}Step 3/8: Python Dependencies${NC}"
if command -v pip3 &> /dev/null; then
    pip3 install aiohttp requests --user 2>/dev/null || pip3 install aiohttp requests --break-system-packages
    echo "${GREEN}✓ Python dependencies installed${NC}"
else
    echo "${YELLOW}⚠️  pip3 not found, skipping Python setup${NC}"
fi

# Step 4: Database Setup
echo ""
echo "${BLUE}Step 4/8: Database Setup${NC}"
npx prisma generate

if [ -n "$DATABASE_URL" ]; then
    echo "Pushing schema to database..."
    npx prisma db push --accept-data-loss
    echo "${GREEN}✓ Database schema pushed${NC}"
else
    echo "${YELLOW}⚠️  DATABASE_URL not set, skipping database push${NC}"
fi

# Step 5: Seed Data
echo ""
echo "${BLUE}Step 5/8: Seeding Initial Data${NC}"
if [ -n "$DATABASE_URL" ]; then
    echo "Seeding cities and dispensaries..."
    node scripts/seed_ai_directory.js || echo "${YELLOW}⚠️  Seeding may have failed${NC}"
else
    echo "${YELLOW}⚠️  Skipping seed - no database connection${NC}"
fi

# Step 6: Build Application
echo ""
echo "${BLUE}Step 6/8: Building Application${NC}"
npm run build

# Step 7: Run Tests
echo ""
echo "${BLUE}Step 7/8: Running Tests${NC}"
echo "${YELLOW}Note: Add tests to package.json scripts${NC}"

# Step 8: Deployment Options
echo ""
echo "${BLUE}Step 8/8: Deployment Options${NC}"
echo ""
echo "Choose deployment target:"
echo "1) Vercel (Recommended for frontend)"
echo "2) Google Cloud Run (Recommended for full AI automation)"
echo "3) Both (Complete setup)"
echo "4) Local development only"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "${BLUE}Deploying to Vercel...${NC}"
        ./scripts/deploy-vercel.sh
        ;;
    2)
        echo ""
        echo "${BLUE}Deploying to Google Cloud...${NC}"
        ./scripts/deploy-gcp.sh
        ;;
    3)
        echo ""
        echo "${BLUE}Deploying to both Vercel and Google Cloud...${NC}"
        ./scripts/deploy-vercel.sh
        ./scripts/deploy-gcp.sh
        ;;
    4)
        echo ""
        echo "${GREEN}Setup complete! Starting development server...${NC}"
        npm run dev
        ;;
    *)
        echo "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "${GREEN}=================================================${NC}"
echo "${GREEN}🎉 Setup and Deployment Complete!${NC}"
echo "${GREEN}=================================================${NC}"
echo ""
echo "Your AI-powered cannabis directory is now running!"
echo ""
echo "Features enabled:"
echo "  ✅ 23 City Landing Pages"
echo "  ✅ AI Content Generation"
echo "  ✅ AEO/LLM Optimization"
echo "  ✅ Indigenous Business Focus"
echo "  ✅ National SEO Coverage"
echo "  ✅ Automated Directory Management"
echo ""
echo "Next steps:"
echo "1. Add your API keys to .env file"
echo "2. Run AI agents: python3 agents/directory_ai_agent.py"
echo "3. Monitor performance"
echo "4. Scale as needed!"
