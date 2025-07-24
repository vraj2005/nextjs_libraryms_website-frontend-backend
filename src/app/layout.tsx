import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
        <nav className="sticky top-0 z-30 px-4 md:px-8 py-4 bg-gradient-to-r from-white/95 via-sky-50/95 to-white/95 border-b border-sky-200 shadow-lg rounded-b-2xl flex items-center justify-between backdrop-blur-xl">
          <div className="flex items-center gap-4 md:gap-7">
            <Link
              href="/"
              className="flex items-center gap-2 md:gap-3 font-extrabold text-xl md:text-3xl text-sky-700 drop-shadow-xl tracking-wider hover:scale-105 transition-transform duration-300 group"
              aria-label="LibraryMS Home"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 md:w-12 md:h-12 text-amber-500 animate-pulse drop-shadow-lg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-amber-500 bg-clip-text text-transparent group-hover:tracking-widest transition-all duration-300 relative overflow-hidden">
                <span className="inline-block group-hover:animate-shimmer">LibraryMS</span>
                <span className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer-glow" />
              </span>
            </Link>
            <div className="hidden lg:flex gap-7 ml-8 items-center">
              <div className="relative group">
                <button className="px-3 md:px-4 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base hover:shadow-lg transform hover:scale-105" aria-haspopup="true" aria-expanded="false">
                  Categories
                  <svg className="w-3 h-3 md:w-4 md:h-4 transition-all duration-700 group-hover:rotate-180 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div className="absolute left-0 mt-3 w-56 md:w-64 bg-white/95 border border-sky-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none group-hover:pointer-events-auto transition-all duration-700 ease-out z-30 scale-90 group-hover:scale-100 p-3 grid grid-cols-2 gap-2 translate-y-4 group-hover:translate-y-0 backdrop-blur-xl ring-1 ring-sky-200/50">
                  <Link href="/category/fiction" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm transform hover:scale-105 hover:shadow-md hover:border hover:border-sky-200 group/item">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-400 transition-all duration-200 group-hover/item:scale-125 group-hover/item:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    <span className="group-hover/item:text-purple-600 transition-colors duration-200">Fiction</span>
                  </Link>
                  <Link href="/category/non-fiction" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm transform hover:scale-105 hover:shadow-md hover:border hover:border-sky-200 group/item">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400 transition-all duration-200 group-hover/item:scale-125 group-hover/item:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <span className="group-hover/item:text-green-600 transition-colors duration-200">Non-Fiction</span>
                  </Link>
                  <Link href="/category/academic" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm transform hover:scale-105 hover:shadow-md hover:border hover:border-sky-200 group/item">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-400 transition-all duration-200 group-hover/item:scale-125 group-hover/item:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                    <span className="group-hover/item:text-blue-600 transition-colors duration-200">Academic</span>
                  </Link>
                  <Link href="/category/journals" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm transform hover:scale-105 hover:shadow-md hover:border hover:border-sky-200 group/item">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-400 transition-all duration-200 group-hover/item:scale-125 group-hover/item:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"/></svg>
                    <span className="group-hover/item:text-orange-600 transition-colors duration-200">Journals</span>
                  </Link>
                  <Link href="/category/reference" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm transform hover:scale-105 hover:shadow-md hover:border hover:border-sky-200 group/item">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400 transition-all duration-200 group-hover/item:scale-125 group-hover/item:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span className="group-hover/item:text-red-600 transition-colors duration-200">Reference</span>
                  </Link>
                  <Link href="/category/digital" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm transform hover:scale-105 hover:shadow-md hover:border hover:border-sky-200 group/item">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-pink-400 transition-all duration-200 group-hover/item:scale-125 group-hover/item:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <span className="group-hover/item:text-pink-600 transition-colors duration-200">Digital Books</span>
                  </Link>
                </div>
              </div>
              <Link
                href="/books"
                className="px-3 md:px-4 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base"
              >
                Books
              </Link>
              <Link
                href="/about"
                className="px-3 md:px-4 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="px-3 md:px-4 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <form className="hidden md:flex items-center bg-white/80 rounded-xl px-3 py-1 shadow-inner focus-within:ring-2 focus-within:ring-sky-300 transition-all">
              <input
                type="text"
                placeholder="Search books, authors..."
                className="outline-none px-2 py-1 rounded-l-xl text-sky-700 w-32 md:w-56 bg-transparent text-sm md:text-base"
              />
              <button type="submit" className="p-1 text-sky-600 hover:text-amber-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </button>
            </form>
            <Link
              href="/notifications"
              className="relative group hover:scale-110 transition-transform"
              aria-label="Notifications"
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 shadow whitespace-nowrap">Notifications</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 md:w-8 md:h-8 text-sky-700 group-hover:text-blue-500 drop-shadow"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-white shadow animate-pulse">2</span>
            </Link>
            <Link
              href="/favorites"
              className="relative group hover:scale-110 transition-transform"
              aria-label="Favorites"
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 shadow">Favorites</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 md:w-7 md:h-7 text-pink-500 group-hover:text-pink-700 drop-shadow" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.8 7.6c0-2.5-2-4.5-4.5-4.5-1.5 0-2.8.7-3.6 1.8C12.5 3.8 11.2 3.1 9.7 3.1c-2.5 0-4.5 2-4.5 4.5 0 4.2 7.1 9.1 7.1 9.1s7.1-4.9 7.1-9.1z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-pink-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-white shadow animate-pulse">5</span>
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-xl bg-sky-100/60 hover:bg-sky-200/80 text-sky-700 font-semibold shadow transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:shadow-lg" aria-haspopup="true" aria-expanded="false">
                <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-sky-200 via-sky-100 to-amber-100 flex items-center justify-center text-sky-700 font-bold border border-sky-200 shadow-inner text-xs md:text-sm transition-all duration-200 group-hover:scale-110 group-hover:rotate-6">U</span>
                <span className="hidden md:inline transition-all duration-200 group-hover:text-sky-900">Account</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 md:w-5 md:h-5 transition-all duration-700 group-hover:rotate-180 group-hover:scale-110"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z"
                  />
                </svg>
              </button>
              <div className="absolute right-0 mt-3 w-48 md:w-56 bg-white/95 border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none group-hover:pointer-events-auto transition-all duration-700 ease-out z-10 scale-90 group-hover:scale-100 overflow-hidden translate-y-4 group-hover:translate-y-0 backdrop-blur-xl ring-1 ring-sky-200/50">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 md:px-6 py-3 hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:translate-x-2 group/item border-l-4 border-transparent hover:border-purple-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 transition-all duration-200 group-hover/item:scale-125 group-hover/item:text-purple-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
                  </svg>
                  <span className="group-hover/item:text-purple-600 transition-colors duration-200">Profile</span>
                </Link>
                <Link
                  href="/borrowed"
                  className="flex items-center gap-2 px-4 md:px-6 py-3 hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:translate-x-2 group/item border-l-4 border-transparent hover:border-amber-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 transition-all duration-200 group-hover/item:scale-125 group-hover/item:text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  <span className="group-hover/item:text-amber-600 transition-colors duration-200">My Books</span>
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 md:px-6 py-3 hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:translate-x-2 group/item border-l-4 border-transparent hover:border-sky-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 transition-all duration-200 group-hover/item:scale-125 group-hover/item:text-sky-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3a2.25 2.25 0 01-2.25-2.25V9m7.5 0h-10.5" />
                  </svg>
                  <span className="group-hover/item:text-sky-900 transition-colors duration-200">Login</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-4 md:px-6 py-3 hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:translate-x-2 group/item border-l-4 border-transparent hover:border-green-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 transition-all duration-200 group-hover/item:scale-125 group-hover/item:text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75A2.25 2.25 0 0014.25 4.5h-4.5A2.25 2.25 0 007.5 6.75v3.75m9 0v6.75A2.25 2.25 0 0114.25 19.5h-4.5A2.25 2.25 0 017.5 17.25v-6.75m9 0h-10.5" />
                  </svg>
                  <span className="group-hover/item:text-green-600 transition-colors duration-200">Register</span>
                </Link>
              </div>
            </div>
            {/* Mobile menu button */}
            <button className="lg:hidden p-2 text-sky-700 hover:bg-sky-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
        
        {/* Mobile nav */}
        <div className="lg:hidden flex flex-col items-center bg-white/90 backdrop-blur-lg shadow rounded-b-2xl border-b sticky top-0 z-20">
          <form className="flex items-center bg-white/90 rounded-xl px-3 py-2 shadow-inner mt-3 mb-2 w-11/12 max-w-md">
            <input
              type="text"
              placeholder="Search books, authors..."
              className="outline-none px-2 py-1 rounded-l-xl text-sky-700 w-full bg-transparent text-sm"
            />
            <button type="submit" className="p-1 text-sky-600 hover:text-amber-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </button>
          </form>
          <div className="flex gap-4 md:gap-6 py-3 overflow-x-auto w-full px-4">
            <Link
              href="/books"
              className="px-3 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm whitespace-nowrap text-sm"
            >
              Browse
            </Link>
            <Link
              href="/borrowed"
              className="px-3 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm whitespace-nowrap text-sm"
            >
              My Books
            </Link>
            <Link
              href="/profile"
              className="px-3 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm whitespace-nowrap text-sm"
            >
              Profile
            </Link>
            <Link
              href="/categories"
              className="px-3 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm whitespace-nowrap text-sm"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm whitespace-nowrap text-sm"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="px-3 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm whitespace-nowrap text-sm"
            >
              Contact
            </Link>
          </div>
        </div>
        
        {children}
        
        {/* Footer */}
        <footer className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white mt-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="footer-books" patternUnits="userSpaceOnUse" width="20" height="20">
                  <rect width="20" height="20" fill="none"/>
                  <text x="2" y="10" fontSize="8" fill="currentColor">📚</text>
                  <text x="12" y="15" fontSize="6" fill="currentColor">📖</text>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#footer-books)"/>
            </svg>
          </div>

          {/* Library Features Section */}
          <div className="relative z-10 bg-gradient-to-r from-sky-600/20 via-indigo-600/20 to-sky-600/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="text-center mb-12">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Why Choose LibraryMS?</h3>
                <p className="text-sky-100 text-lg max-w-2xl mx-auto">Experience the future of digital library management with our comprehensive features</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="group flex flex-col items-center text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-white group-hover:text-sky-200 transition-colors">Digital Access</h4>
                  <p className="text-sky-100 text-sm">Unlimited access to our vast digital collection</p>
                </div>
                
                <div className="group flex flex-col items-center text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-white group-hover:text-green-200 transition-colors">Extended Borrowing</h4>
                  <p className="text-sky-100 text-sm">Borrow books for up to 30 days with renewals</p>
                </div>
                
                <div className="group flex flex-col items-center text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-white group-hover:text-purple-200 transition-colors">Secure Platform</h4>
                  <p className="text-sky-100 text-sm">Your data and reading history are protected</p>
                </div>
                
                <div className="group flex flex-col items-center text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-white group-hover:text-amber-200 transition-colors">24/7 Availability</h4>
                  <p className="text-sky-100 text-sm">Access your library anytime, anywhere</p>
                </div>
                
                <div className="group flex flex-col items-center text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-white group-hover:text-pink-200 transition-colors">Expert Support</h4>
                  <p className="text-sky-100 text-sm">Get help from professional librarians</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              
              {/* Company Info */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">LibraryMS</h3>
                    <p className="text-sky-200 text-sm">Digital Library System</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">Empowering knowledge seekers with cutting-edge digital library management and comprehensive academic resources.</p>
                
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300 hover:text-sky-300 transition-colors">
                    <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span className="text-sm">507 Education Centre, Library District</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 hover:text-sky-300 transition-colors">
                    <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span className="text-sm">library@libraryms.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 hover:text-sky-300 transition-colors">
                    <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span className="text-sm font-medium text-sky-300">+91 9876-543-210</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-bold text-white mb-6 relative">
                  Quick Links
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-sky-400 to-indigo-500 rounded"></div>
                </h4>
                <ul className="space-y-3">
                  {[
                    { name: "Browse Catalog", href: "/browse" },
                    { name: "New Arrivals", href: "/new-arrivals" },
                    { name: "Popular Books", href: "/popular" },
                    { name: "Academic Resources", href: "/academic" },
                    { name: "Digital Archive", href: "/archive" },
                    { name: "Research Papers", href: "/research" }
                  ].map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href} 
                        className="text-gray-300 hover:text-sky-300 transition-all duration-300 text-sm flex items-center gap-2 group"
                      >
                        <svg className="w-4 h-4 text-sky-400 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Library Services */}
              <div>
                <h4 className="text-lg font-bold text-white mb-6 relative">
                  Library Services
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded"></div>
                </h4>
                <ul className="space-y-3">
                  {[
                    { name: "Book Reservation", href: "/services/reservation" },
                    { name: "Inter-library Loan", href: "/services/interlibrary" },
                    { name: "Study Room Booking", href: "/services/study-rooms" },
                    { name: "Research Assistance", href: "/services/research" },
                    { name: "Digital Workshops", href: "/services/workshops" },
                    { name: "Member Portal", href: "/member-portal" }
                  ].map((service) => (
                    <li key={service.name}>
                      <Link 
                        href={service.href} 
                        className="text-gray-300 hover:text-green-300 transition-all duration-300 text-sm flex items-center gap-2 group"
                      >
                        <svg className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">{service.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="text-lg font-bold text-white mb-6 relative">
                  Stay Connected
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded"></div>
                </h4>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed">Subscribe to our newsletter for updates on new books, events, and digital resources.</p>
                
                <form className="space-y-4">
                  <div className="relative">
                    <input 
                      type="email" 
                      placeholder="Enter your email address" 
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-sky-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    Subscribe Now
                  </button>
                  <label className="flex items-start gap-3 text-xs text-gray-400 mt-3">
                    <input type="checkbox" className="mt-0.5 rounded border-gray-600 bg-white/10 text-sky-500 focus:ring-sky-400 focus:ring-offset-gray-900" />
                    <span>I agree to receive updates and promotional content via email</span>
                  </label>
                </form>

                {/* Social Links */}
                <div className="mt-8">
                  <p className="text-white font-medium mb-4">Follow Us</p>
                  <div className="flex gap-4">
                    {[
                      { name: "Facebook", href: "#", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z", color: "hover:text-blue-400" },
                      { name: "Twitter", href: "#", icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z", color: "hover:text-sky-400" },
                      { name: "LinkedIn", href: "#", icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z", color: "hover:text-blue-500" },
                      { name: "Instagram", href: "#", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z", color: "hover:text-pink-400" }
                    ].map((social) => (
                      <a 
                        key={social.name}
                        href={social.href} 
                        aria-label={social.name}
                        className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-lg`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d={social.icon}/>
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-gray-400 text-sm text-center md:text-left">
                  © 2025 LibraryMS. All rights reserved. | 
                  <Link href="/privacy" className="text-sky-400 hover:text-sky-300 ml-1 transition-colors">Privacy Policy</Link> | 
                  <Link href="/terms" className="text-sky-400 hover:text-sky-300 ml-1 transition-colors">Terms of Service</Link>
                </div>
                <div className="text-gray-400 text-sm">
                  Proudly serving the academic community since 2025
                </div>
              </div>
            </div>
          </div>
        </footer>
        
      </body>
    </html>
  );
}
