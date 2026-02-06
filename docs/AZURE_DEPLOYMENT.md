# LoveScroll Azure Deployment Guide
## WordPress handles payment → Azure handles the experience

---

## ARCHITECTURE RECAP

```
ramedia.com (WordPress + WooCommerce)
  └─ Customer buys a tier ($19/$49/$99)
  └─ WooCommerce webhook fires on purchase ────►

ramedia.dev (Azure App Service)
  └─ /api/webhook/woocommerce  ← receives order
  └─ /create?token=xxx         ← buyer uploads photos + writes letter
  └─ /v/jake-and-emma          ← the experience
  └─ /admin                    ← your dashboard
  └─ Azure PostgreSQL          ← database
  └─ Azure Blob Storage        ← photo storage
  └─ Gmail API                 ← delivery emails
```

---

## PART 1: AZURE STORAGE ACCOUNT (5 minutes)

You already have: App Service (P0V4) + PostgreSQL. Now add photo storage.

### Step 1.1 — Create a Storage Account

1. Go to https://portal.azure.com
2. Search "Storage accounts" → click **"+ Create"**
3. Fill in:
   - **Resource group:** `Valentines-Day-2026` (your existing one)
   - **Storage account name:** `lovescrollphotos` (must be globally unique, lowercase, no hyphens)
   - **Region:** East US 2 (same as your other resources)
   - **Performance:** Standard
   - **Redundancy:** LRS (cheapest — fine for photos)
4. Click **Review + Create → Create**
5. Wait 30 seconds for deployment

### Step 1.2 — Get Storage Keys

1. Go into your new storage account
2. Left sidebar → **Access keys**
3. Click **"Show"** on Key 1
4. Copy:
   - **Storage account name** (e.g. `lovescrollphotos`)
   - **Key** (long base64 string)

Save these for later:
```
AZURE_STORAGE_ACCOUNT_NAME=lovescrollphotos
AZURE_STORAGE_ACCOUNT_KEY=abc123...your-key...
```

The container `experience-photos` will be auto-created on first upload.

---

## PART 2: DATABASE SCHEMA (3 minutes)

### Step 2.1 — Connect to your Azure PostgreSQL

You can use any of these:
- **Azure Data Studio** (free, recommended)
- **pgAdmin** (free)
- **psql** command line
- **Azure Portal → PostgreSQL → Query Editor** (if available)

Connection details (from Azure Portal → your PostgreSQL server → Connection strings):
```
Host:     your-server.postgres.database.azure.com
Port:     5432
Database: postgres (or create a new one called 'lovescroll')
Username: your-admin-username
Password: your-admin-password
SSL:      Required
```

### Step 2.2 — Run the schema

Open `sql/schema.sql` from the project and run the entire contents.

You should see the `experiences` table created with all columns and indexes.

### Step 2.3 — Get your connection string

From Azure Portal → PostgreSQL server → Connection strings, copy the PostgreSQL format:
```
AZURE_POSTGRESQL_CONNECTION_STRING=postgresql://username:password@yourserver.postgres.database.azure.com:5432/postgres?sslmode=require
```

---

## PART 3: GMAIL API (10 minutes)

Same setup as before — see `docs/GMAIL_SETUP.md` for the complete guide.

You need:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=lovescroll@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GMAIL_SEND_FROM=hello@ramedia.com
```

---

## PART 4: DEPLOY TO AZURE APP SERVICE (10 minutes)

### Step 4.1 — Unzip and install

```bash
unzip lovescroll-azure-FINAL.zip
cd lovescroll-azure
npm install
```

### Step 4.2 — Create .env.local for local testing

```bash
cp .env.local.example .env.local
```

Fill in all values.

### Step 4.3 — Test locally

```bash
npm run dev
```

Visit http://localhost:3000/create?token=test — you should see the token error page (which means the app is running).

### Step 4.4 — Set environment variables in Azure

Go to Azure Portal → your App Service → **Configuration → Application settings**

Add each variable (click "+ New application setting" for each):

```
AZURE_POSTGRESQL_CONNECTION_STRING = postgresql://...
AZURE_STORAGE_ACCOUNT_NAME        = lovescrollphotos
AZURE_STORAGE_ACCOUNT_KEY          = your-key
AZURE_STORAGE_CONTAINER            = experience-photos
GOOGLE_SERVICE_ACCOUNT_EMAIL       = lovescroll@...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...
GMAIL_SEND_FROM                    = hello@ramedia.com
WOO_WEBHOOK_SECRET                 = (set this after WooCommerce setup)
NEXT_PUBLIC_APP_URL                = https://ramedia.dev
NEXT_PUBLIC_DOMAIN                 = ramedia.dev
NEXT_PUBLIC_WP_URL                 = https://ramedia.com
ADMIN_SECRET                       = pick-a-random-string
CRON_SECRET                        = pick-another-random-string
```

Also add:
```
WEBSITE_NODE_DEFAULT_VERSION = ~20
PORT                         = 3000
```

Click **Save** at the top.

### Step 4.5 — Deploy via GitHub Actions (recommended)

Push to GitHub:
```bash
git init
git add .
git commit -m "LoveScroll Azure MVP"
git remote add origin https://github.com/YOUR_USERNAME/lovescroll-azure.git
git push -u origin main
```

In Azure Portal → App Service → **Deployment Center**:
1. Source: **GitHub**
2. Sign in to GitHub
3. Select your repo and branch (main)
4. Build provider: **GitHub Actions**
5. Runtime: **Node.js 20**
6. Click **Save**

Azure will auto-generate a GitHub Actions workflow. The first deploy will take 3-5 minutes.

### Step 4.6 — Alternative: Deploy via ZIP

If you prefer not to use GitHub:

```bash
# Build the app
npm run build

# Install Azure CLI if you haven't
# https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Deploy
az webapp deploy \
  --resource-group Valentines-Day-2026 \
  --name YOUR_APP_SERVICE_NAME \
  --src-path .next/standalone \
  --type zip
```

### Step 4.7 — Set startup command

In Azure Portal → App Service → **Configuration → General settings**:

Startup command:
```
node .next/standalone/server.js
```

Click **Save**.

### Step 4.8 — Verify deployment

Visit your App Service URL:
```
https://valentines-ajh6erf5dcgpaxeb.eastus2-01.azurewebsites.net
```

It should redirect to ramedia.com (that's the root page behavior).

Test the admin:
```
https://valentines-ajh6erf5dcgpaxeb.eastus2-01.azurewebsites.net/admin?secret=YOUR_ADMIN_SECRET
```

---

## PART 5: CONNECT RAMEDIA.DEV (5 minutes)

### Step 5.1 — Add custom domain in Azure

1. Azure Portal → App Service → **Custom domains**
2. Click **"+ Add custom domain"**
3. Domain: `ramedia.dev`
4. Azure will show DNS instructions

### Step 5.2 — Add DNS records in Squarespace

Go to Squarespace → Domains → ramedia.dev → DNS Settings:

Add these records:
```
Type:  A
Host:  @
Value: (Azure's IP address — shown in the custom domain setup)

Type:  TXT
Host:  asuid
Value: (Azure's verification string — shown in custom domain setup)
```

### Step 5.3 — Enable SSL

Once DNS propagates (1-30 min):
1. Go back to App Service → Custom domains
2. Click on `ramedia.dev`
3. Click **"Add binding"** → **"Create App Service Managed Certificate"**
4. Azure provisions a free SSL cert for `ramedia.dev`

Note: This is a single-domain cert (not wildcard), which is exactly what we need since we're using paths (`/v/slug`) not subdomains.

---

## PART 6: WOOCOMMERCE SETUP (15 minutes)

### Step 6.1 — Install WooCommerce Stripe Gateway

1. Go to your WordPress admin (ramedia.com/wp-admin)
2. Plugins → Add New → search **"WooCommerce Stripe Payment Gateway"**
3. Install and activate it
4. Go to WooCommerce → Settings → Payments → Stripe
5. Click **"Create or connect an account"** or enter your Stripe API keys:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`
6. Enable **"Test mode"** for now
7. Save

### Step 6.2 — Create 3 products

Go to WooCommerce → Products → Add New

**Product 1: LoveScroll Lite**
- Name: `LoveScroll Lite`
- Regular price: `$19.00`
- SKU: `lovescroll-lite`
- Virtual: ✅ Yes (no shipping)
- Short description: "3 photos, 30-day hosting"
- Publish

**Product 2: LoveScroll Classic**
- Name: `LoveScroll Classic`
- Regular price: `$49.00`
- SKU: `lovescroll-classic`
- Virtual: ✅ Yes
- Short description: "7 photos, reaction recording, 6-month hosting"
- Publish

**Product 3: LoveScroll Forever**
- Name: `LoveScroll Forever`
- Regular price: `$99.00`
- SKU: `lovescroll-forever`
- Virtual: ✅ Yes
- Short description: "10 photos, reaction recording, priority, 1-year hosting"
- Publish

### Step 6.3 — Create the webhook

This is the critical bridge between WordPress and Azure.

1. Go to WooCommerce → Settings → Advanced → Webhooks
2. Click **"Add webhook"**
3. Fill in:
   - **Name:** `LoveScroll Order`
   - **Status:** Active
   - **Topic:** Order updated
   - **Delivery URL:** `https://ramedia.dev/api/webhook/woocommerce`
   - **Secret:** generate a random string (e.g. from https://generate-secret.vercel.app/32)
4. Click **Save webhook**
5. Copy the **Secret** — you need it for Azure

### Step 6.4 — Add the webhook secret to Azure

Go to Azure Portal → App Service → Configuration → Application settings:

Add:
```
WOO_WEBHOOK_SECRET = (the secret you just generated)
```

Save and restart the App Service.

### Step 6.5 — Customize the order confirmation

WooCommerce sends an automatic "Order complete" email. You can customize it:

1. WooCommerce → Settings → Emails → Processing Order
2. Add to the email body:
   ```
   Check your inbox for a separate email with your creation link!
   If you don't see it within 5 minutes, check your spam folder.
   ```

---

## PART 7: EMAIL DELIVERY CRON (5 minutes)

Azure App Service doesn't have built-in cron like Vercel. Options:

### Option A: Azure Timer Trigger (recommended, free)

1. Azure Portal → Search "Function App" → Create
   - Resource group: `Valentines-Day-2026`
   - Name: `lovescroll-cron`
   - Runtime: Node.js 20
   - Plan: Consumption (pay-per-execution, essentially free)
2. Create a Timer Trigger function:
   - Schedule: `0 */5 * * * *` (every 5 minutes)
   - Code:
   ```javascript
   module.exports = async function (context) {
     const res = await fetch('https://ramedia.dev/api/send-delivery', {
       method: 'GET',
       headers: { 'Authorization': 'Bearer YOUR_CRON_SECRET' }
     });
     context.log('Delivery check:', await res.json());
   };
   ```

### Option B: External cron service (simplest)

Use https://cron-job.org (free):
1. Create account
2. Add job:
   - URL: `https://ramedia.dev/api/send-delivery`
   - Method: GET
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: Every 5 minutes
3. Save

### Option C: Azure WebJob (runs inside your App Service)

1. Create a file `cron.js`:
   ```javascript
   setInterval(async () => {
     try {
       await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-delivery`, {
         headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` }
       });
     } catch (e) { console.error('Cron error:', e); }
   }, 5 * 60 * 1000);
   ```
2. Configure as an "Always On" WebJob in App Service

**Recommendation:** Start with Option B (cron-job.org) — it takes 2 minutes and works perfectly.

---

## PART 8: TEST THE FULL FLOW (10 minutes)

### Step 8.1 — Test WooCommerce webhook

1. Go to ramedia.com → your LoveScroll product
2. Buy it with Stripe test card: `4242 4242 4242 4242`
3. After payment, WooCommerce fires the webhook
4. Check your email — you should receive the "Create your LoveScroll" email with a link
5. Check Azure Portal → App Service → Log Stream to see the webhook processing

### Step 8.2 — Test the creation flow

1. Click the creation link from the email (or copy it)
2. You'll land on `ramedia.dev/create?token=ls_xxx`
3. Enter names, upload photos, write a love letter
4. Submit → land on /ready page with your link

### Step 8.3 — Test the experience

1. Open the experience link
2. Full flow: Opening → Memories → Heart Game → Love Letter
3. Test on mobile too

### Step 8.4 — Test email delivery

Manually trigger:
```bash
curl -X POST https://ramedia.dev/api/send-delivery \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json"
```

### Step 8.5 — Check admin dashboard

Visit: `https://ramedia.dev/admin?secret=YOUR_ADMIN_SECRET`

---

## PART 9: GO LIVE CHECKLIST

- [ ] Azure App Service running and accessible
- [ ] ramedia.dev SSL cert active
- [ ] PostgreSQL schema created
- [ ] Storage Account created
- [ ] Gmail API configured
- [ ] WooCommerce products created (Lite/Classic/Forever)
- [ ] WooCommerce Stripe in LIVE mode (not test)
- [ ] Webhook pointing to ramedia.dev
- [ ] Webhook secret matching in Azure config
- [ ] Cron job running every 5 minutes
- [ ] Test purchase completed successfully
- [ ] Experience works on mobile
- [ ] Admin dashboard showing data
- [ ] Email delivery working

---

## TROUBLESHOOTING

### Webhook not receiving
- Check WooCommerce → Settings → Advanced → Webhooks → your webhook → "Delivery URL"
- URL must be `https://ramedia.dev/api/webhook/woocommerce` (exact)
- Check the webhook status — WooCommerce disables webhooks after too many failures
- Check Azure Log Stream for errors

### Photos not uploading
- Check AZURE_STORAGE_ACCOUNT_NAME and KEY are correct
- The container auto-creates, but check permissions in Azure Portal

### "Invalid token" on create page
- The webhook may not have fired yet — check WooCommerce webhook logs
- Order status must be "processing" or "completed" — pending orders don't trigger

### SSL not working on ramedia.dev
- DNS propagation can take up to 48 hours
- Check Azure → Custom Domains → verify the TXT record is correct
- .dev domains REQUIRE HTTPS — the site won't load on HTTP

### App Service crashing
- Check Log Stream in Azure Portal
- Make sure `WEBSITE_NODE_DEFAULT_VERSION` is set to `~20`
- Make sure startup command is `node .next/standalone/server.js`
- Check all env vars are set (14 total)

---

## COSTS

| Service | Cost |
|---------|------|
| Azure App Service P0V4 | ~$30/mo (already deployed) |
| Azure PostgreSQL Flexible | ~$15/mo (already deployed) |
| Azure Storage (photos) | ~$0.02/GB/mo (negligible) |
| WordPress.com Premium | existing plan |
| Gmail API | free (2000 emails/day) |
| cron-job.org | free |
| SSL for ramedia.dev | free (Azure managed cert) |
| **Total additional** | **~$0.02/mo** (just storage) |
