# GET IT RUNNING — Quick Start

## What you need before starting
- ✅ Azure App Service (P0V4) — you have this
- ✅ Azure PostgreSQL Flexible Server — you have this  
- ❓ Azure Storage Account — create in Step 1
- ❓ Database schema — run in Step 2

---

## Step 1: Create Azure Storage Account (2 min)

Azure Portal → Search "Storage accounts" → **+ Create**

- Resource group: `Valentines-Day-2026`
- Name: `lovescrollphotos` (or any unique name)
- Region: East US 2
- Performance: Standard
- Redundancy: LRS

Create it → go into it → **Access keys** → copy:
- Account name
- Key1

---

## Step 2: Run database schema (2 min)

Connect to your PostgreSQL (Azure Data Studio, pgAdmin, or Azure Portal query editor).

Paste the entire contents of `sql/schema.sql` → Run.

---

## Step 3: Set App Service environment variables (5 min)

Azure Portal → your App Service → **Configuration** → **Application settings**

Add these (click "+ New application setting" for each):

```
AZURE_POSTGRESQL_CONNECTION_STRING  =  your-connection-string
AZURE_STORAGE_ACCOUNT_NAME          =  lovescrollphotos
AZURE_STORAGE_ACCOUNT_KEY           =  your-key
AZURE_STORAGE_CONTAINER             =  experience-photos
ADMIN_SECRET                        =  test123
CRON_SECRET                         =  cron123
NEXT_PUBLIC_APP_URL                 =  https://YOUR-APP-SERVICE-URL.azurewebsites.net
NEXT_PUBLIC_DOMAIN                  =  YOUR-APP-SERVICE-URL.azurewebsites.net
NEXT_PUBLIC_WP_URL                  =  https://ramedia.com
PORT                                =  3000
WEBSITES_PORT                       =  3000
WEBSITE_NODE_DEFAULT_VERSION        =  ~20
```

Skip Gmail vars for now — we just want to see the site.

Click **Save**.

---

## Step 4: Deploy the code (5 min)

### Option A: GitHub (recommended)

```bash
cd lovescroll-azure
git init
git add .
git commit -m "LoveScroll Azure"
```

Push to GitHub. Then in Azure Portal:
- App Service → **Deployment Center**
- Source: GitHub → select repo → branch: main
- Runtime: Node.js 20
- Save

### Option B: Local Git Deploy

Azure Portal → App Service → Deployment Center → Source: **Local Git**

Copy the Git URL shown. Then:

```bash
cd lovescroll-azure
git init
git add .
git commit -m "LoveScroll Azure"
git remote add azure YOUR_AZURE_GIT_URL
git push azure main
```

### After deploy — set startup command:

Azure Portal → App Service → Configuration → **General settings**:

Startup command:
```
npm run start
```

Save and restart.

---

## Step 5: Test it (2 min)

### 5a. Check the app is running
Visit: `https://YOUR-APP.azurewebsites.net/create?token=test`

You should see an error page saying "Invalid token" — that means the app is running and talking to the database.

### 5b. Seed a demo experience
Visit: `https://YOUR-APP.azurewebsites.net/api/seed?secret=test123`

You'll get a JSON response with URLs.

### 5c. View the experience
Visit the `experienceUrl` from the seed response:
`https://YOUR-APP.azurewebsites.net/v/demo-love-story`

You should see the full experience:
1. Opening scene (Jake & Emma)
2. "Scroll to begin"  
3. Memory sections with tap interactions
4. Heart catch game
5. Love letter with typewriter effect

### 5d. Check admin
Visit: `https://YOUR-APP.azurewebsites.net/admin?secret=test123`

---

## Troubleshooting

### App won't start
- Check Log Stream (App Service → Monitoring → Log Stream)
- Make sure PORT is set to 3000
- Make sure startup command is `npm run start`

### "relation experiences does not exist"
- You haven't run the SQL schema yet (Step 2)

### Seed returns connection error
- Check AZURE_POSTGRESQL_CONNECTION_STRING is correct
- Format: `postgresql://user:pass@server.postgres.database.azure.com:5432/postgres?sslmode=require`
- Make sure your App Service IP is allowed in PostgreSQL firewall rules

### Photos don't load (demo uses Unsplash, so should work)
- If using your own photos later, check Storage Account keys

### Can't access the site at all
- Check App Service is running (Overview → Status should be "Running")
- Check the app URL is correct
- Try restarting the App Service
