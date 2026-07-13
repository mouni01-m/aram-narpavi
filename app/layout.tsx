import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { AuthProvider } from "@/app/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Aram Narpavi Herbals - Premium Natural Wellness Products",
  description: "Discover premium herbal wellness products crafted from natural ingredients. Shop soaps, health malts, oils, honey, and wellness solutions.",
  keywords: "herbal products, natural wellness, herbal soaps, health malt, organic products",
  authors: [{ name: "Aram Narpavi Herbals" }],
  openGraph: {
    title: "Aram Narpavi Herbals",
    description: "Premium natural wellness products",
    url: "https://aramnarpavi.com",
    siteName: "Aram Narpavi Herbals",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#F8F7F2]">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
