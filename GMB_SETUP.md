# Google My Business (GMB) Integration Setup

## 🔑 Getting GMB API Access

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "Mohawk Medibles Directory")
3. Enable the **Google My Business API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google My Business API"
   - Click "Enable"

### Step 2: Create Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name: `gmb-sync-service`
4. Role: `Owner` or `Editor`
5. Create and download JSON key file

### Step 3: Get GMB Account Info

1. Go to [Google Business Profile Manager](https://business.google.com/)
2. Note your account name (format: `accounts/123456789`)
3. Grant access to service account:
   - In GMB manager, add service account email as "Owner" or "Manager"
   - Service account email looks like: `gmb-sync-service@project-id.iam.gserviceaccount.com`

## ⚙️ Environment Configuration

Add these to your `.env` file:

```bash
# Google My Business API
GMB_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GMB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
GMB_ACCOUNT_NAME=accounts/YOUR_ACCOUNT_ID
```

**Important**: 
- Keep the `\n` in the private key (they represent newlines)
- The private key should be the entire content from the JSON key file

## 🚀 Usage

### One-time Sync

```bash
# Sync all GMB locations to database
node scripts/sync-gmb.js
```

### API Endpoint

```bash
# Sync via API (admin only)
POST /api/admin/sync-gmb
```

### Programmatic Usage

```typescript
import { gmbIntegration } from '@/lib/gmb-integration';

// Sync all locations
const result = await gmbIntegration.syncAllLocations();
console.log(`Synced: ${result.success}, Failed: ${result.failed}`);

// Fetch reviews for a location
const reviews = await gmbIntegration.fetchReviews('accounts/xxx/locations/xxx');

// Get insights (analytics)
const insights = await gmbIntegration.fetchInsights(
  'accounts/xxx/locations/xxx',
  '2024-01-01',
  '2024-01-31'
);
```

## 📊 What Gets Synced

### From GMB to Your Database:

| GMB Field | Database Field | Notes |
|-----------|---------------|-------|
| Location Name | `name` | Business name |
| Address | `address`, `city`, `province`, `postalCode` | Full address split |
| Lat/Lng | `latitude`, `longitude` | For maps |
| Phone | `phone` | Primary phone |
| Website | `website` | Business URL |
| Description | `description` | Business description |
| Hours | `hours` | Weekly schedule |
| Photos | `images` | All photos |
| Reviews | `reviews` | Customer reviews |

### Data Quality Score

Businesses synced from GMB automatically get a high score (85/100) because:
- ✅ Verified by Google
- ✅ Complete address
- ✅ Phone number
- ✅ Business hours
- ✅ Reviews
- ✅ Photos

This makes them "Premium" listings automatically!

## 🔄 Automatic Sync Options

### Option 1: Cron Job (Recommended)

Add to crontab to sync daily:

```bash
# Edit crontab
crontab -e

# Add line for daily sync at 2 AM
0 2 * * * cd /path/to/MohawkMedibles_SEO_v1.0 && node scripts/sync-gmb.js >> logs/gmb-sync.log 2>&1
```

### Option 2: Vercel Cron (Serverless)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-gmb",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Create `app/api/cron/sync-gmb/route.ts`:

```typescript
import { gmbIntegration } from '@/lib/gmb-integration';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await gmbIntegration.syncAllLocations();
  return Response.json(result);
}
```

### Option 3: Manual Admin Dashboard

Add a "Sync GMB" button to your admin panel:

```tsx
<button 
  onClick={async () => {
    const res = await fetch('/api/admin/sync-gmb', { method: 'POST' });
    const data = await res.json();
    alert(`Synced: ${data.success} businesses`);
  }}
>
  Sync with Google My Business
</button>
```

## 📈 Analytics Dashboard

Create an admin page to view GMB insights:

```tsx
// app/admin/gmb-analytics/page.tsx
export default async function GMBAnalytics() {
  const { gmbIntegration } = require('@/lib/gmb-integration');
  
  const insights = await gmbIntegration.fetchInsights(
    process.env.GMB_LOCATION_ID,
    '2024-01-01',
    '2024-01-31'
  );

  return (
    <div>
      <h1>GMB Analytics</h1>
      <div>Map Views: {insights.viewsMaps}</div>
      <div>Search Views: {insights.viewsSearch}</div>
      <div>Website Clicks: {insights.actionsWebsite}</div>
      <div>Phone Calls: {insights.actionsPhone}</div>
    </div>
  );
}
```

## 🐛 Troubleshooting

### "API not enabled"
```
Enable Google My Business API in Google Cloud Console
```

### "Insufficient permissions"
```
1. Make sure service account email is added to GMB as Manager/Owner
2. Check that GMB_CLIENT_EMAIL matches exactly
```

### "Invalid private key"
```
1. Download fresh JSON key from Google Cloud
2. Copy entire private_key value
3. Ensure \n characters are preserved
```

### "Account not found"
```
GMB_ACCOUNT_NAME should be format: accounts/123456789
Find it in GMB URL or API explorer
```

## 🔒 Security

- Never commit `.env` file
- Rotate service account keys regularly
- Use minimum required permissions ("Manager" not "Owner" if possible)
- Monitor API usage in Google Cloud Console

## 📞 Support

- [GMB API Documentation](https://developers.google.com/my-business/)
- [Google Cloud Support](https://cloud.google.com/support)
- Enable debug logging: `DEBUG=gmb:* npm run sync`

---

**Status**: Ready to sync with your GMB account!
