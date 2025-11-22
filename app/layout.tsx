import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Etopmattress | Premium Mattresses for Better Sleep",
  description: "Experience the perfect night's sleep with our premium collection of mattresses. Quality comfort, exceptional support, unbeatable prices.",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <head>
          {/* Preload critical resources */}
          <link rel="preload" href="/images/Interio_AI.gif" as="image" type="image/gif" />

          {/* DNS prefetch for external domains */}
          <link rel="dns-prefetch" href="//cdn.sanity.io" />
          <link rel="dns-prefetch" href="//images.unsplash.com" />
          <link rel="dns-prefetch" href="//js.stripe.com" />
          <link rel="dns-prefetch" href="//fonts.googleapis.com" />
          <link rel="dns-prefetch" href="//fonts.gstatic.com" />

          {/* Preconnect for critical domains */}
          <link rel="preconnect" href="https://js.stripe.com" />
          <link rel="preconnect" href="https://api.clerk.dev" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </head>

        <body className={`${poppins.variable} antialiased`} suppressHydrationWarning={true}>
          {children}
          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          )}
          <Script id="performance-monitoring" strategy="afterInteractive">
            {`
              // Register service worker
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }

              // Performance monitoring
              window.addEventListener('load', () => {
                // Measure page load time
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log('Page load time:', loadTime + 'ms');

                // Measure First Contentful Paint
                if (window.performance && window.performance.getEntriesByType) {
                  const fcpEntries = window.performance.getEntriesByType('paint');
                  const fcp = fcpEntries.find(entry => entry.name === 'first-contentful-paint');
                  if (fcp) {
                    console.log('First Contentful Paint:', fcp.startTime + 'ms');
                  }
                }
              });
            `}
          </Script>
        </body>
      </html>
    </ClerkProvider>
  );
}