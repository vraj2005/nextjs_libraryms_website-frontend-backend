"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Check if user is authenticated and has admin role
        if (!user || user.role !== 'ADMIN') {
          // Also check localStorage for backward compatibility with existing admin sessions
          const adminAuth = localStorage.getItem("adminAuth");
          const adminUserData = localStorage.getItem("adminUser");
          
          if (!adminAuth || adminAuth !== "true" || !adminUserData) {
            // Not authenticated as admin, redirect to login
            router.push("/login");
            return;
          }
          
          // Validate the admin user data format
          try {
            const adminUser = JSON.parse(adminUserData);
            if (!adminUser.username || !adminUser.role) {
              throw new Error("Invalid admin user data");
            }
            // Valid legacy admin session exists
            setIsAuthorized(true);
          } catch (error) {
            // Invalid admin data, clear and redirect
            localStorage.removeItem("adminAuth");
            localStorage.removeItem("adminUser");
            router.push("/login");
            return;
          }
        } else {
          // User is properly authenticated with admin role
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Admin auth check error:", error);
        router.push("/login");
        return;
      }
      
      setIsLoading(false);
    };

    checkAdminAuth();
  }, [user, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
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
  return <>{children}</>;
}
