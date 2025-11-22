import Header from "@/components/navigation/Header";
import Footer from "@/components/Footer";
import { SanityLive } from "@/sanity/lib/live";
import { Toaster } from "react-hot-toast";
import { VisualEditing } from "next-sanity";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <SanityLive />
      <Toaster position="top-center" />
      {process.env.NODE_ENV === "development" && <VisualEditing />}
    </>
  );
}