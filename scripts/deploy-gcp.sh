#!/bin/bash
#
# Google Cloud Platform Deployment Script
# Deploys to Cloud Run with full AI automation
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="mohawk-medibles"

echo "🚀 Mohawk Medibles - Google Cloud Deployment"
echo "============================================="
echo ""

# Check prerequisites
echo "${BLUE}Checking prerequisites...${NC}"

if ! command -v gcloud &> /dev/null; then
    echo "${RED}Error: gcloud CLI not found${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "${RED}Error: Docker not found${NC}"
    exit 1
fi

# Check if logged in
echo ""
echo "${BLUE}Checking GCP authentication...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "${YELLOW}Please login to Google Cloud:${NC}"
    gcloud auth login
fi

# Set project
if [ -z "$PROJECT_ID" ]; then
    echo ""
    echo "${YELLOW}Select a Google Cloud project:${NC}"
    gcloud projects list
    echo ""
    read -p "Enter Project ID: " PROJECT_ID
fi

gcloud config set project $PROJECT_ID
echo "${GREEN}✓ Using project: $PROJECT_ID${NC}"

# Enable required APIs
echo ""
echo "${BLUE}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
#gcloud services enable run.googleapis.com
#gcloud services enable secretmanager.googleapis.com
#gcloud services enable containerregistry.googleapis.com
echo "${GREEN}✓ APIs enabled${NC}"

# Set up secrets
echo ""
echo "${BLUE}Setting up Secret Manager...${NC}"

# Function to create or update secret
create_secret() {
    local name=$1
    local value=$2
    
    if gcloud secrets versions list $name &> /dev/null; then
        echo "  Updating secret: $name"
        echo -n "$value" | gcloud secrets versions add $name --data-file=-
    else
        echo "  Creating secret: $name"
        echo -n "$value" | gcloud secrets create $name --data-file=-
    fi
}

# Get secrets from user
if [ -z "$DATABASE_URL" ]; then
    read -p "Enter DATABASE_URL: " DATABASE_URL
fi
if [ -z "$OPENAI_API_KEY" ]; then
    read -p "Enter OPENAI_API_KEY: " OPENAI_API_KEY
fi
if [ -z "$PERPLEXITY_API_KEY" ]; then
    read -p "Enter PERPLEXITY_API_KEY: " PERPLEXITY_API_KEY
fi
if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    NEXT_PUBLIC_APP_URL="https://mohawkmedibles.ca"
fi

create_secret "database-url" "$DATABASE_URL"
create_secret "openai-api-key" "$OPENAI_API_KEY"
create_secret "perplexity-api-key" "$PERPLEXITY_API_KEY"
create_secret "next-public-app-url" "$NEXT_PUBLIC_APP_URL"

echo "${GREEN}✓ Secrets configured${NC}"

# Build and push Docker image
echo ""
echo "${BLUE}Building Docker image...${NC}"
IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

docker build -t $IMAGE_TAG .
docker push $IMAGE_TAG

echo "${GREEN}✓ Image built and pushed${NC}"

# Deploy to Cloud Run
echo ""
echo "${BLUE}Deploying to Cloud Run...${NC}"

gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_TAG \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --concurrency 80 \
    --max-instances 100 \
    --min-instances 1 \
    --set-env-vars "NODE_ENV=production,NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL" \
    --set-secrets "DATABASE_URL=database-url:latest,OPENAI_API_KEY=openai-api-key:latest,PERPLEXITY_API_KEY=perplexity-api-key:latest"

echo "${GREEN}✓ Cloud Run deployment complete${NC}"

# Get service URL
echo ""
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")
echo "🌐 Service URL: $SERVICE_URL"

# Set up Cloud Scheduler for AI automation
echo ""
echo "${BLUE}Setting up Cloud Scheduler...${NC}"

# Create service account for scheduler
SERVICE_ACCOUNT="mohawk-scheduler@$PROJECT_ID.iam.gserviceaccount.com"
if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT &> /dev/null; then
    gcloud iam service-accounts create mohawk-scheduler \
        --display-name="Mohawk Medibles Scheduler"
fi

# Grant invoker permission
gcloud run services add-iam-policy-binding $SERVICE_NAME \
    --region $REGION \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/run.invoker"

# Create scheduled jobs
for job in ai-automation seo-optimization; do
    if gcloud scheduler jobs describe $job --location=$REGION &> /dev/null; then
        gcloud scheduler jobs delete $job --location=$REGION --quiet
    fi
done

# AI Automation - every 6 hours
gcloud scheduler jobs create http ai-automation \
    --schedule="0 */6 * * *" \
    --uri="$SERVICE_URL/api/cron/ai-automation" \
    --http-method=POST \
    --location=$REGION \
    --service-account=$SERVICE_ACCOUNT \
    --message-body="{}"

# SEO Optimization - daily at 2 AM
gcloud scheduler jobs create http seo-optimization \
    --schedule="0 2 * * *" \
    --uri="$SERVICE_URL/api/cron/seo-optimization" \
    --http-method=POST \
    --location=$REGION \
    --service-account=$SERVICE_ACCOUNT \
    --message-body="{}"

echo "${GREEN}✓ Cloud Scheduler jobs created${NC}"

# Verify deployment
echo ""
echo "${BLUE}Verifying deployment...${NC}"
sleep 5

if curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL" | grep -q "200"; then
    echo "${GREEN}✅ Service is live and responding!${NC}"
else
    echo "${YELLOW}⚠️  Service may still be starting. Check Cloud Run console.${NC}"
fi

echo ""
echo "${GREEN}🎉 Google Cloud deployment successful!${NC}"
echo ""
echo "Service Details:"
echo "  URL: $SERVICE_URL"
echo "  Region: $REGION"
echo "  Project: $PROJECT_ID"
echo ""
echo "Next steps:"
echo "1. Configure custom domain in Cloud Run console"
echo "2. Set up Cloud Monitoring alerts"
echo "3. Test AI agents: gcloud run services proxy $SERVICE_NAME --region=$REGION"
echo "4. View logs: gcloud logging tail --service=$SERVICE_NAME"
