# TRACK.ONLINE — Production Deployment Guide

## Project Structure

```
track-online/
├── src/
│   ├── app/
│   │   ├── api/track/[trackingNumber]/route.ts   ← API endpoint
│   │   ├── (root)/page.tsx                        ← Main page
│   │   └── layout.tsx
│   ├── components/tracking/
│   │   ├── SearchBar.tsx
│   │   ├── TrackingCard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Timeline.tsx
│   │   ├── TrackingSkeleton.tsx
│   │   └── ErrorState.tsx
│   ├── hooks/useTracking.ts
│   ├── lib/
│   │   ├── api/track17Client.ts       ← 17TRACK API client
│   │   ├── services/trackingService.ts ← Core service layer
│   │   ├── types/tracking.ts
│   │   └── utils/
│   │       ├── sanitizer.ts           ← Strips all merchant/courier data
│   │       ├── statusMapper.ts
│   │       └── rateLimit.ts
│   └── styles/globals.css
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Environment Variables

```bash
# Required
TRACK17_API_KEY=your_17track_api_key_here

# Auto-set by Vercel
NEXT_PUBLIC_APP_URL=https://track.online
NODE_ENV=production
```

---

## Step 1 — Get Your 17TRACK API Key

1. Go to https://api.17track.net/
2. Register for an account
3. Navigate to API Keys → Create Key
4. Copy the key into your `.env.local`

---

## Step 2 — Local Development

```bash
# Clone and install
cd track-online
npm install

# Create local env
cp .env.example .env.local
# Add your TRACK17_API_KEY to .env.local

# Run dev server
npm run dev
# → http://localhost:3000
```

---

## Step 3 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# Settings → Environment Variables → Add:
# TRACK17_API_KEY = your_key_here

# Or via CLI:
vercel env add TRACK17_API_KEY
```

**Vercel Settings:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Node.js Version: 20.x

---

## Step 4 — Custom Domain on Vercel

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add `track.online`
3. Update your Namecheap DNS:
   - Type: `A` | Name: `@` | Value: `76.76.21.21`
   - Type: `CNAME` | Name: `www` | Value: `cname.vercel-dns.com`
4. SSL is automatic via Vercel

---

## Architecture Notes

### Data Flow
```
User types tracking number
    → SearchBar component
    → useTracking hook
    → GET /api/track/[number]
    → rateLimit check (10 req/min per IP)
    → input validation
    → track17Client.registerTracking()
    → track17Client.getTracking()
    → trackingService.resolveTracking()
    → sanitizer strips ALL merchant/courier refs
    → clean TrackingResult returned
    → TrackingCard renders result
```

### What Gets Filtered (server-side, never reaches user)
- All courier/carrier names
- All marketplace names (AliExpress, Amazon, SHEIN, Temu, etc.)
- Merchant/seller/supplier references
- Warehouse names that reveal marketplace origin
- Internal logistics codes

### What Users See
- Tracking number
- Status (In Transit, Delivered, etc.)
- Origin country → Destination country
- Estimated delivery date
- Days in transit
- Current location (city, country)
- Timeline chain (date • time — location — generic event description)

### Rate Limiting
- 10 requests per IP per minute
- In-memory store (resets on restart)
- For production scale: replace with Redis via Upstash

### Caching
- 17TRACK responses cached for 5 minutes via Next.js `fetch` cache
- CDN cache headers: `s-maxage=300, stale-while-revalidate=600`

---

## Suggested Improvements (without changing design)

1. **Redis rate limiting** — Replace in-memory with Upstash Redis for persistent limits across serverless instances
2. **Webhook from 17TRACK** — Instead of polling, receive push updates when status changes
3. **Response caching** — Cache resolved results in Redis with TTL to reduce 17TRACK API costs
4. **Analytics** — Track most-searched tracking numbers (anonymized) to monitor usage
5. **Error monitoring** — Add Sentry for production error tracking
6. **Health endpoint** — `GET /api/health` for uptime monitoring
