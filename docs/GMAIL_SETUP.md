# Gmail API Setup Guide (Google Workspace)

## Step 1: Google Cloud Console

1. Go to https://console.cloud.google.com
2. Select your project (or create a new one called "LoveScroll")
3. Go to **APIs & Services → Library**
4. Search for **Gmail API** → Click **Enable**

## Step 2: Create Service Account

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → Service Account**
3. Name: `lovescroll-email`
4. Click **Create and Continue**
5. Skip the role and access steps → Click **Done**
6. Click on the service account you just created
7. Go to **Keys** tab → **Add Key → Create New Key → JSON**
8. Download the JSON file — it contains your private key

From the JSON file, you need:
- `client_email` → this is your `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → this is your `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

## Step 3: Enable Domain-Wide Delegation

1. On the service account page, click **Edit** (pencil icon)
2. Under **Show domain-wide delegation**, check **Enable Google Workspace Domain-wide Delegation**
3. Save. Note the **Client ID** (a long number).

## Step 4: Grant Access in Google Workspace Admin

1. Go to https://admin.google.com
2. Navigate to **Security → Access and data control → API controls**
3. Click **Manage Domain Wide Delegation**
4. Click **Add new**
5. Client ID: paste the Client ID from Step 3
6. OAuth Scopes: `https://www.googleapis.com/auth/gmail.send`
7. Click **Authorize**

## Step 5: Add to .env.local

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=lovescroll-email@your-project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...your key here...\n-----END PRIVATE KEY-----\n"
GMAIL_SEND_FROM=hello@ramedia.com
```

**Important:** The `GMAIL_SEND_FROM` must be a real Google Workspace user email 
(e.g., hello@ramedia.com). The service account will impersonate this user to send emails.

## Step 6: Verify It Works

After deploying, you can test by creating a test experience. 
The cron job runs every 5 minutes, or you can manually trigger:

```bash
curl -X POST https://love.ramedia.com/api/send-delivery \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json"
```

## Limits

- Google Workspace: **2,000 emails/day** per user
- If you need more, create multiple sending addresses and rotate
