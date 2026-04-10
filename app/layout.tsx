import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import Script from "next/script";
import { Toaster } from 'sonner';
import "./globals.css";
import CommandPalette from "@/components/shared/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediBook — Book Doctor Appointments Online",
  description:
    "Find trusted doctors, book appointments instantly, and manage your healthcare journey with MediBook. India's premium healthcare booking platform.",
  keywords: [
    "doctor appointment",
    "book doctor online",
    "healthcare",
    "medical consultation",
    "MediBook",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <CommandPalette />
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
