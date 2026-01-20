import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import NavBar from "./components/NavBar";
import LogoBanner from "./components/LogoBanner";
import TopAdBanner from "./components/TopAdBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thornton Events",
  description: "Discover amazing events happening in Thornton, CO and beyond!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <TopAdBanner />
          <LogoBanner />
          <NavBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
