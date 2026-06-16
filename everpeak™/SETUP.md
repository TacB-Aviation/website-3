# 📸 Photography Availability Calendar — Setup Guide

No passwords stored anywhere. Security is handled entirely by Cloudflare.

---

## How it works

| URL | Who sees it |
|-----|-------------|
| `yoursite.com/` | Everyone — read-only calendar |
| `yoursite.com/admin` | Only you, after logging in via Cloudflare Access |

The admin page lets you paint day statuses. Changes save to **Cloudflare KV** so every visitor immediately sees the updated calendar.

---

## Step 1 — Deploy to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages** → **Create a project** → **Upload assets**
2. Upload this entire folder (or connect your GitHub repo)
3. No build command needed. Output directory = `/` (root)
4. Hit **Save and Deploy**

---

## Step 2 — Create a KV Namespace

1. In Cloudflare dashboard → **Workers & Pages** → **KV**
2. Click **Create namespace**
3. Name it `AVAILABILITY_KV` → **Add**
4. Copy the **Namespace ID** shown

---

## Step 3 — Bind KV to your Pages project

1. Go to your Pages project → **Settings** → **Functions**
2. Under **KV namespace bindings** → **Add binding**
   - Variable name: `AVAILABILITY_KV`
   - KV namespace: select `AVAILABILITY_KV`
3. **Save** and redeploy

Also paste your Namespace ID into `wrangler.toml` where it says `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` (only needed if you use the Wrangler CLI locally).

---

## Step 4 — Protect /admin with Cloudflare Access

This is what keeps strangers out of your admin page — no passwords needed.

1. Go to [one.dash.cloudflare.com](https://one.dash.cloudflare.com) → **Access** → **Applications**
2. Click **Add an application** → **Self-hosted**
3. Fill in:
   - **App name**: Photography Admin
   - **App domain**: `yoursite.com` / **Path**: `admin`
4. Under **Policies** → **Add a policy**:
   - Policy name: Owner only
   - Action: Allow
   - Rule: **Emails** → enter YOUR email address
5. Save

Now when you visit `yoursite.com/admin`, Cloudflare shows a login screen. You log in with your email (Cloudflare sends a one-time code). Visitors who try to go to `/admin` are blocked entirely.

---

## Step 5 — Also protect the POST API endpoint

Repeat Step 4 for the API save route:

- **App domain**: `yoursite.com` / **Path**: `api/statuses` (POST method)

Or simply: the Function at `functions/api/statuses.js` already checks for the `Cf-Access-Authenticated-User-Email` header that Cloudflare Access injects — unauthenticated POST requests are rejected with a 401 even if someone tries to call the API directly.

---

## File structure

```
/
├── index.html                  ← Public calendar (read-only)
├── admin/
│   └── index.html              ← Owner editing panel (protected)
├── functions/
│   └── api/
│       └── statuses.js         ← GET (public) + POST (owner only)
└── wrangler.toml               ← KV binding config
```

---

## Color key

| Color | Meaning |
|-------|---------|
| 🟢 Green | Available for shoots |
| 🟡 Yellow | Might not be available |
| 🔴 Red | Not available, no exceptions |
| 🔵 Blue | Already booked |
