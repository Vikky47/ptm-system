# 🎓 PTM Attendance & Feedback System
### Aakash Institute — 2025

A lightweight, scalable PTM (Parent-Teacher Meeting) attendance and feedback system built with Next.js and Google Sheets.

---

## 🏗️ System Architecture

```
Parent scans QR → /ptm?region=X&branch=Y → Fills form → Google Sheets
Admin → /admin → Manage regions/branches → Generate QR codes
```

---

## 📁 Project Structure

```
ptm-system/
├── pages/
│   ├── index.js              # Redirects to admin
│   ├── ptm.js                # Parent-facing form (mobile-first)
│   ├── admin/
│   │   ├── index.js          # Admin CMS (regions, branches, QR, settings)
│   │   └── login.js          # Admin login
│   └── api/
│       ├── auth/login.js     # Auth endpoint
│       ├── admin/store.js    # CRUD for regions/branches/settings
│       ├── qr/generate.js    # QR code generation
│       ├── submit.js         # Form submission → Google Sheets
│       └── branches.js       # Public branches list
├── lib/
│   ├── data.js               # Seed data (regions + branches)
│   ├── store.js              # In-memory store
│   └── sheets.js             # Google Sheets API helper
├── styles/
│   └── globals.css           # Global styles
├── .env.example              # Environment variables template
└── vercel.json               # Vercel deployment config
```

---

## 🚀 Deployment Guide (Vercel — Recommended)

### Step 1: Push to GitHub

```bash
cd ptm-system
git init
git add .
git commit -m "Initial PTM system"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/ptm-system.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy**

### Step 3: Set Environment Variables on Vercel

Go to: Vercel Dashboard → Your Project → **Settings → Environment Variables**

Add these:

| Variable | Value |
|----------|-------|
| `ADMIN_PASSWORD` | `Aesl@1234` |
| `NEXT_PUBLIC_BASE_URL` | `https://your-project.vercel.app` |
| `GOOGLE_SHEETS_EMAIL` | *(from GCP setup below)* |
| `GOOGLE_SHEETS_KEY` | *(from GCP setup below)* |

### Step 4: Redeploy after setting env vars

Vercel Dashboard → **Deployments → Redeploy**

---

## 📊 Google Sheets Setup (One-time, ~10 minutes)

### 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **New Project** → Name it `ptm-system` → Create
3. Select the project

### 2. Enable Google Sheets API

1. Go to **APIs & Services → Library**
2. Search for **Google Sheets API** → Click → **Enable**

### 3. Create Service Account

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → Service Account**
3. Name: `ptm-sheets` → Click **Create and Continue → Done**
4. Click on the service account → **Keys tab → Add Key → JSON**
5. A `.json` file downloads — keep it safe!

### 4. Set Environment Variables from the JSON

Open the downloaded JSON file. You'll see:
```json
{
  "client_email": "ptm-sheets@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
}
```

Set on Vercel:
- `GOOGLE_SHEETS_EMAIL` = value of `client_email`
- `GOOGLE_SHEETS_KEY` = value of `private_key` (paste the entire string including `\n`)

### 5. Share Your Google Sheet

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/18U8hwcqpXKuOZyfjy-6LHz3gFnmc4CDq3CS0EUCZHJo
2. Click **Share**
3. Add the service account email (e.g. `ptm-sheets@your-project.iam.gserviceaccount.com`)
4. Give **Editor** access → **Send**

### 6. Headers will be auto-created

On the first form submission, the system automatically creates the header row:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Timestamp | PSID | Stream | Mode | Region | Branch | Overall Experience | Physics | Chemistry | Mathematics | Biology | English | Social Science | MAT | Branch Facilities | Comments |

---

## 🖥️ Using the Admin Panel

### Access
- URL: `https://your-project.vercel.app/admin`
- Password: `Aesl@1234`

### Tabs

| Tab | What you can do |
|-----|----------------|
| **Regions** | Add / Edit / Delete regions |
| **Branches** | Add / Edit / Delete branches, map to regions |
| **QR Codes** | Generate and download QR codes per branch |
| **Settings** | Update Google Sheet URL |

### Generating QR Codes

1. Go to **QR Codes** tab
2. Click **Generate All QRs** or generate per branch
3. Click **⬇️ Download PNG** to save
4. Print and place at branch reception

---

## 📱 Parent Form Flow

1. Parent scans QR code at branch
2. Form opens at: `/ptm?region=Central&branch=Lucknow+-+Gomti+Nagar&branchId=...`
3. Branch and region are **pre-filled and locked**
4. Parent fills: PSID, Stream, Mode, Ratings, Comments
5. Submits → data goes directly to Google Sheet

---

## 🔧 Local Development

```bash
cd ptm-system
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
# Open http://localhost:3000
```

---

## 📋 Pre-seeded Data

**7 Regions:** Central, East, South, North, West, NCR, Rajasthan

**22 Branches:**
| Branch | Region |
|--------|--------|
| Agra | West |
| Agra - Taj Nagari | West |
| Aligarh | NCR |
| Bareilly | North |
| Dehradun (Rajpur Road) | North |
| Dehradun (Ballupur Chowk) | North |
| Etawah | West |
| Haridwar | North |
| Jhansi | East |
| Kanpur-1 (Kakadeo) | Central |
| Kanpur-2 (Phoolbagh) | Central |
| Lucknow - Alambagh | Central |
| Lucknow - Gomti Nagar | Central |
| Lucknow - Hazratganj | Central |
| Lucknow - Vrindavan Yojana | Central |
| Mathura | West |
| Medical Road | North |
| Meerut | NCR |
| Meerut - Modipuram | NCR |
| Muzaffarnagar | NCR |
| Raebareli | Central |
| Unnao | Central |

> You can edit all of this in the Admin Panel → no code changes needed.

---

## ⚠️ Important Notes

1. **Data persistence**: The in-memory store resets on Vercel cold starts. For production, consider upgrading to [Vercel KV](https://vercel.com/docs/storage/vercel-kv) (free tier available) — see upgrade note below.

2. **Without Google Sheets credentials**: Form submissions are logged to Vercel's function logs. The UI still works completely.

3. **QR codes encode your Vercel URL** — make sure `NEXT_PUBLIC_BASE_URL` is set correctly before printing QRs.

---

## 🔄 Upgrading to Persistent Storage (Optional)

For the region/branch data to persist across Vercel deployments, upgrade `lib/store.js` to use Vercel KV:

```bash
npm install @vercel/kv
```

Then in `lib/store.js`:
```js
import { kv } from '@vercel/kv';
export async function getStore() {
  return await kv.get('ptm-store') || DEFAULT_DATA;
}
export async function saveStore(data) {
  await kv.set('ptm-store', data);
}
```

---

## 🛟 Support

Built for Aakash Institute PTM 2025. For issues, check Vercel function logs at:
`Vercel Dashboard → Project → Functions → Logs`
