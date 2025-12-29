import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/setup-admin'
])

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/shop(.*)',
  '/product(.*)',
  '/contact(.*)',
  '/about(.*)',
  '/checkout(.*)',
  '/guest-checkout(.*)',
  '/cart(.*)',
  '/orders(.*)',
  '/order-success(.*)',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Protect admin routes
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  const { userId } = await auth()

  // If user is authenticated and not on auth pages, sync user to Sanity
  if (userId && !isPublicRoute(req) && !req.url.includes('/api/')) {
    // Trigger user sync in background (non-blocking)
    fetch(`${req.nextUrl.origin}/api/auth/sync-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((error) => {
      console.error('Background user sync failed:', error);
    });
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|studio|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}