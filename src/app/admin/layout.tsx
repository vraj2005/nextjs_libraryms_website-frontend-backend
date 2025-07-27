"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminNavbar from "@/app/admin/components/AdminNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // First check if we have a proper authenticated user with ADMIN role
        if (user && user.role === 'ADMIN') {
          setIsAuthorized(true);
          return;
        }

        // If no proper user auth, clear any old admin localStorage data
        localStorage.removeItem("adminAuth");
        localStorage.removeItem("adminUser");
        
        // Redirect to login
        router.push("/login");
        return;
      } catch (error) {
        console.error("Admin auth check error:", error);
        localStorage.removeItem("adminAuth");
        localStorage.removeItem("adminUser");
        router.push("/login");
        return;
      }
    };

    // Only check auth after the AuthContext has finished loading
    if (!loading) {
      checkAdminAuth();
    }
  }, [user, router, loading]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not admin
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need administrator privileges to access this area.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Render admin content if authorized
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
