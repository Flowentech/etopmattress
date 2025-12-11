import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Etopmattress Studio",
  description: "Content Management Studio for Etopmattress",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

const StudioLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default StudioLayout;
