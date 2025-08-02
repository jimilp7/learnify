import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bodyClassName = `${geistSans.variable} ${geistMono.variable} antialiased`;

export const metadata: Metadata = {
  title: "Learnify 🤓",
  description: "Your personal AI tutor - Spotify for learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={bodyClassName}
      >
        {children}
      </body>
    </html>
  );
}
