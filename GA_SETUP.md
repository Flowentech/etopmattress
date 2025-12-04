# Google Analytics Setup

## Overview
Google Analytics has been integrated into this Next.js application using the official `@next/third-parties/google` package.

## Configuration

### Local Development
The Google Analytics tracking ID is configured in `.env.local`:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-VWEN8D9SZ1
```

### Production Deployment
**IMPORTANT**: When deploying to production (Vercel, Netlify, etc.), you MUST add the environment variable:

**Environment Variable:**
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-VWEN8D9SZ1
```

#### Vercel Setup:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add: `NEXT_PUBLIC_GA_MEASUREMENT_ID` with value `G-VWEN8D9SZ1`
4. Select all environments (Production, Preview, Development)
5. Redeploy your application

#### Netlify Setup:
1. Go to Site settings → Environment variables
2. Add: `NEXT_PUBLIC_GA_MEASUREMENT_ID` with value `G-VWEN8D9SZ1`
3. Redeploy your site

## Implementation Details

The Google Analytics script is automatically loaded in the root layout (`app/layout.tsx`):

```tsx
{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
  <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
)}
```

This ensures:
- ✅ Google Analytics only loads when the environment variable is set
- ✅ Proper Next.js Script component optimization
- ✅ Automatic page view tracking
- ✅ Privacy-friendly implementation

## Verification

### Check if GA is Working:
1. Open your website in a browser
2. Open Chrome DevTools (F12)
3. Go to the "Network" tab
4. Filter by "gtag"
5. You should see requests to `https://www.googletagmanager.com/gtag/js?id=G-VWEN8D9SZ1`

### Real-time Testing:
1. Go to Google Analytics Dashboard
2. Navigate to "Reports" → "Realtime"
3. Open your website
4. You should see your session appear in real-time

## Tracking ID
**Current GA4 Property ID:** `G-VWEN8D9SZ1`

## Notes
- The tracking script uses `@next/third-parties/google` for optimal performance
- Analytics are loaded after interactive content (non-blocking)
- The script respects user privacy preferences
- Page views are tracked automatically on route changes
