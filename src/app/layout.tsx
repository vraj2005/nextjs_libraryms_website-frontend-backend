import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavigation from "./components/ConditionalNavigation";
import ConditionalFooter from "./components/ConditionalFooter";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LibraryMS - Digital Library Management System",
  description: "Comprehensive library management system for books, journals, and digital resources",
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
        style={{ background: 'linear-gradient(120deg, #f0f9ff 0%, #e0f2fe 100%)' }}
      >
        <AuthProvider>
          <NotificationProvider>
            <ConditionalNavigation />
            
            {children}
            
            <ConditionalFooter />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
