import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import AuthErrorBanner from "./components/AuthErrorBanner";
import BottomNav from "./components/BottomNav";
import AfterLoginRedirect from "./components/AfterLoginRedirect";
import SiteFooter from "./components/SiteFooter";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

import { AuthProvider } from "@/lib/useAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages set their own title; it shows as "Hoodie – ₱1,500 | BukiFinds".
  title: {
    default: `${SITE_NAME} – Student marketplace in Bukidnon`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "BukiFinds",
    "Bukidnon",
    "student marketplace",
    "buy and sell",
    "swap",
    "pre-loved",
    "school uniforms",
    "school shoes",
    "textbooks",
    "BukSU",
    "Bukidnon State University",
    "CMU",
    "Central Mindanao University",
    "Malaybalay",
    "Valencia",
    "Maramag",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_PH",
    url: "/",
    title: `${SITE_NAME} – Student marketplace in Bukidnon`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Student marketplace in Bukidnon`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

// Lets fixed bottom bars pad for the iPhone home indicator with env(safe-area-inset-bottom).
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-ink">
        <AuthProvider>
          <Navbar />
          <AuthErrorBanner />
          {children}
          <SiteFooter />
          <BottomNav />
          <AfterLoginRedirect />
        </AuthProvider>
      </body>
    </html>
  );
}
