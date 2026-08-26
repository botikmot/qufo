import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ConfirmDialogProvider } from "@/components/providers/confirm-dialog-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://qufo.im"),

  title: {
    default: "QUFO — Business Workflow Management",
    template: "%s | QUFO",
  },

  description:
    "Manage customers, quotations, approvals, jobs, payments, and customer tracking in one connected business workflow.",

  applicationName: "QUFO",
  creator: "QUFO",
  publisher: "QUFO",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://qufo.im",
    siteName: "QUFO",

    title: "QUFO — Run Your Entire Workflow Without the Chaos",

    description:
      "Manage customers, quotations, approvals, jobs, payments, and customer tracking in one connected workspace.",

    images: [
      {
        url: "/images/qufo-social-preview.png",
        width: 1200,
        height: 630,
        alt: "QUFO — Business Workflow Management",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "QUFO — Run Your Entire Workflow Without the Chaos",

    description:
      "Manage customers, quotations, jobs, payments, and customer tracking in one connected workspace.",

    images: ["/images/qufo-social-preview.png"],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("dark", "h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", figtree.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ConfirmDialogProvider>
          {children}
        </ConfirmDialogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
