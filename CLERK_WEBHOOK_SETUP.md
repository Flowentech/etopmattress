# Clerk Webhook Setup Guide

## Problem
Users signing up through Clerk were not appearing in the admin users list because their profiles weren't being created in Sanity CMS.

## Solution
A Clerk webhook handler has been created to automatically create user profiles in Sanity when users sign up.

---

## Setup Instructions

### Step 1: Add Webhook Secret to Environment Variables

1. **Local Development** - Add to `.env.local`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

2. **Production** - Add to your hosting platform (Vercel, Netlify, etc.):
   ```
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### Step 2: Configure Webhook in Clerk Dashboard

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. Navigate to your application
3. Click on **"Webhooks"** in the left sidebar
4. Click **"Add Endpoint"**

### Step 3: Endpoint Configuration

**Endpoint URL:**
- **Local Testing (using ngrok or similar):**
  ```
  https://your-ngrok-url.ngrok.io/api/webhooks/clerk
  ```

- **Production:**
  ```
  https://your-domain.com/api/webhooks/clerk
  ```

**Select Events to Subscribe:**
- ✅ `user.created` (Required)
- ✅ `user.updated` (Recommended)
- ✅ `user.deleted` (Optional)

**Signing Secret:**
- Copy the signing secret shown after creating the endpoint
- Add it to your environment variables as `CLERK_WEBHOOK_SECRET`

### Step 4: Test the Webhook

#### Option A: Test with a New User Signup
1. Sign up a new user in your app
2. Check the webhook logs in Clerk Dashboard
3. Verify the user appears in `/admin/users`

#### Option B: Test with Clerk's Webhook Testing Tool
1. In Clerk Dashboard → Webhooks → Your Endpoint
2. Click "Test" or "Send Test Event"
3. Select `user.created` event
4. Click "Send"
5. Check your application logs

---

## What the Webhook Does

### When a user signs up (`user.created`):
```javascript
{
  _type: 'userProfile',
  clerkId: 'user_xxx',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  profilePicture: 'https://...',
  role: 'customer',      // Default role
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### When a user updates their profile (`user.updated`):
- Updates email, name, and profile picture in Sanity
- Creates profile if it doesn't exist yet

### When a user is deleted (`user.deleted`):
- Soft deletes by setting `isActive: false`
- Preserves user data for record keeping

---

## Verifying the Setup

### Check Webhook Status in Clerk:
1. Go to Clerk Dashboard → Webhooks
2. Click on your endpoint
3. Check **"Recent Events"** tab
4. Look for successful deliveries (200 status code)

### Check User Profiles in Sanity:
1. Go to Sanity Studio
2. Navigate to "User Profile" content type
3. Verify new users appear when they sign up

### Check Admin Panel:
1. Go to `/admin/users`
2. All signed-up users should now appear
3. You should see customer count increasing

---

## Troubleshooting

### Users still not appearing?

**1. Check Webhook Secret:**
```bash
# Local
echo $CLERK_WEBHOOK_SECRET

# Production (Vercel)
vercel env ls
```

**2. Check Webhook Logs:**
- Clerk Dashboard → Webhooks → Your Endpoint → Recent Events
- Look for failed deliveries or errors

**3. Check Application Logs:**
```bash
# Development
npm run dev
# Watch for: "Clerk Webhook received: user.created"

# Production (Vercel)
vercel logs
```

**4. Verify Endpoint URL:**
- Make sure the URL is publicly accessible
- Must use HTTPS in production
- Endpoint should be: `/api/webhooks/clerk`

**5. Test Manually:**
```bash
# Check if endpoint is accessible
curl https://your-domain.com/api/webhooks/clerk
# Should return 400 (missing headers) - this is expected
```

### Common Errors:

**"Error: Missing Svix headers"**
- Webhook is not coming from Clerk
- Check endpoint URL configuration

**"Error: Verification failed"**
- `CLERK_WEBHOOK_SECRET` is incorrect or not set
- Get new secret from Clerk Dashboard

**"Error: Failed to create user profile"**
- Check Sanity write token permissions
- Verify `SANITY_WRITE_TOKEN` is set correctly

---

## Environment Variables Checklist

Make sure these are set in both local and production:

- ✅ `CLERK_WEBHOOK_SECRET` - From Clerk Dashboard
- ✅ `SANITY_WRITE_TOKEN` - From Sanity Project Settings
- ✅ `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID
- ✅ `NEXT_PUBLIC_SANITY_DATASET` - Usually "production"

---

## Need Help?

1. Check Clerk's webhook documentation: https://clerk.com/docs/integrations/webhooks
2. Review Sanity client documentation: https://www.sanity.io/docs/js-client
3. Check the webhook route code: `/app/api/webhooks/clerk/route.ts`

---

## File Created
- 📁 `/app/api/webhooks/clerk/route.ts` - Webhook handler
- 📄 This documentation file

🎉 Once configured, all new user signups will automatically create profiles in Sanity!
