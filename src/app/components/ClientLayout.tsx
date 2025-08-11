'use client'

import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import dynamic from "next/dynamic";

// Dynamic imports to prevent hydration issues
const ConditionalNavigation = dynamic(() => import("./ConditionalNavigation"), {
  ssr: false,
  loading: () => (
    <nav className="sticky top-0 z-30 px-4 md:px-8 py-4 bg-gradient-to-r from-white/95 via-sky-50/95 to-white/95 border-b border-sky-200 shadow-lg rounded-b-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 font-extrabold text-xl md:text-3xl text-sky-700">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-amber-500/20 rounded-full animate-pulse" />
          <span>LibraryMS</span>
        </div>
        <div className="w-24 h-8 bg-sky-100 rounded-xl animate-pulse" />
      </div>
    </nav>
  )
});

const ConditionalFooter = dynamic(() => import("./ConditionalFooter"), {
  ssr: false,
  loading: () => null
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <FavoritesProvider>
          <ConditionalNavigation />
          {children}
          <ConditionalFooter />
        </FavoritesProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
