import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "InterioWale Studio",
  description: "Content Management Studio for InterioWale",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
