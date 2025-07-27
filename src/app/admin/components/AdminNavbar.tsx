"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";

export default function AdminNavbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/books", label: "Books" },
    { href: "/admin/members", label: "Members" },
    { href: "/admin/transactions", label: "Transactions" },
    { href: "/admin/requests", label: "Requests" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-xl font-bold text-blue-700 tracking-tight">LibraryMS Admin</Link>
            <div className="hidden md:flex ml-8 gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-gray-700 font-medium">{user?.name || user?.email}</span>
            <button
              onClick={() => {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_user");
                router.push("/login");
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
