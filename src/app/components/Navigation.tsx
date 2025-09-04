"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { unreadCount } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { favoritesCount, refreshFavoritesCount } = useFavorites();
  const pathname = usePathname();

  // Refresh favorites count on route changes (helps when toggling from other pages)
  useEffect(() => {
    refreshFavoritesCount();
  }, [pathname, refreshFavoritesCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const closeAccountDropdown = () => {
    setIsAccountDropdownOpen(false);
  };

  const closeCategoriesDropdown = () => {
    setIsCategoriesDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeAccountDropdown();
  };

  // Get user's initials for avatar
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
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
            <div className="relative group" ref={categoriesDropdownRef}>
              <button 
                onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                className="px-3 md:px-4 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base hover:shadow-lg transform hover:scale-105" 
                aria-haspopup="true" 
                aria-expanded={isCategoriesDropdownOpen}
              >
                Categories
                <svg className={`w-3 h-3 md:w-4 md:h-4 transition-all duration-200 ${isCategoriesDropdownOpen ? 'rotate-180 scale-110' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <div className={`absolute left-0 mt-3 w-56 md:w-64 bg-white/95 border border-sky-100 rounded-2xl shadow-2xl z-30 p-3 grid grid-cols-2 gap-2 backdrop-blur-xl ring-1 ring-sky-200/50 transition-all duration-200 ${isCategoriesDropdownOpen ? 'opacity-100 visible scale-100 translate-y-0' : 'opacity-0 invisible scale-90 translate-y-4'}`}>
                <Link href="/category/fiction" onClick={closeCategoriesDropdown} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm transform hover:scale-105 hover:shadow-md hover:border hover:border-sky-200 group/item">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-400 transition-all duration-200 group-hover/item:scale-125 group-hover/item:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  <span className="group-hover/item:text-purple-600 transition-colors duration-200">Fiction</span>
                </Link>
                <Link href="/category/non-fiction" onClick={closeCategoriesDropdown} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm transform hover:scale-105 hover:shadow-md hover:border hover:border-sky-200 group/item">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400 transition-all duration-200 group-hover/item:scale-125 group-hover/item:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <span className="group-hover/item:text-green-600 transition-colors duration-200">Non-Fiction</span>
                </Link>
                <Link href="/category/academic" onClick={closeCategoriesDropdown} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm transform hover:scale-105 hover:shadow-md hover:border hover:border-sky-200 group/item">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-400 transition-all duration-200 group-hover/item:scale-125 group-hover/item:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                  <span className="group-hover/item:text-blue-600 transition-colors duration-200">Academic</span>
                </Link>
                <Link href="/category/journals" onClick={closeCategoriesDropdown} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm transform hover:scale-105 hover:shadow-md hover:border hover:border-sky-200 group/item">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-400 transition-all duration-200 group-hover/item:scale-125 group-hover/item:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"/></svg>
                  <span className="group-hover/item:text-orange-600 transition-colors duration-200">Journals</span>
                </Link>
                <Link href="/category/reference" onClick={closeCategoriesDropdown} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm transform hover:scale-105 hover:shadow-md hover:border hover:border-sky-200 group/item">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400 transition-all duration-200 group-hover/item:scale-125 group-hover/item:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span className="group-hover/item:text-red-600 transition-colors duration-200">Reference</span>
                </Link>
                <Link href="/category/digital" onClick={closeCategoriesDropdown} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm transform hover:scale-105 hover:shadow-md hover:border hover:border-sky-200 group/item">
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
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-white shadow animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/favorites"
            className="relative group hover:scale-110 transition-transform"
            aria-label="Favorites"
          >
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 shadow">Favorites</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8 text-pink-500 group-hover:text-pink-700 drop-shadow" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.8 7.6c0-2.5-2-4.5-4.5-4.5-1.5 0-2.8.7-3.6 1.8C12.5 3.8 11.2 3.1 9.7 3.1c-2.5 0-4.5 2-4.5 4.5 0 4.2 7.1 9.1 7.1 9.1s7.1-4.9 7.1-9.1z" />
            </svg>
            {favoritesCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-white shadow animate-pulse">
                {favoritesCount}
              </span>
            )}
          </Link>
          <div className="relative" ref={accountDropdownRef}>
            <button 
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-xl bg-sky-100/60 hover:bg-sky-200/80 text-sky-700 font-semibold shadow transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:shadow-lg" 
              aria-haspopup="true" 
              aria-expanded={isAccountDropdownOpen}
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            >
              {user ? (
                <>
                  <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-sky-200 via-sky-100 to-amber-100 flex items-center justify-center text-sky-700 font-bold border border-sky-200 shadow-inner text-xs md:text-sm transition-all duration-200">
                    {getUserInitials(user.firstName, user.lastName)}
                  </span>
                  <span className="hidden md:inline transition-all duration-200 max-w-24 truncate">
                    {user.firstName}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-sky-200 via-sky-100 to-amber-100 flex items-center justify-center text-sky-700 font-bold border border-sky-200 shadow-inner text-xs md:text-sm transition-all duration-200">U</span>
                  <span className="hidden md:inline transition-all duration-200">Account</span>
                </>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${isAccountDropdownOpen ? 'rotate-180' : ''}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z"
                />
              </svg>
            </button>
            <div className={`absolute right-0 mt-3 w-48 md:w-56 bg-white/95 border rounded-2xl shadow-2xl transition-all duration-300 ease-out z-10 overflow-hidden backdrop-blur-xl ring-1 ring-sky-200/50 ${
              isAccountDropdownOpen 
                ? 'opacity-100 visible pointer-events-auto scale-100 translate-y-0' 
                : 'opacity-0 invisible pointer-events-none scale-90 translate-y-4'
            }`}>
              {user ? (
                <>
                  {/* User Info Section */}
                  <div className="px-4 md:px-6 py-3 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-200 via-sky-100 to-amber-100 flex items-center justify-center text-sky-700 font-bold border border-sky-200 shadow-inner">
                        {getUserInitials(user.firstName, user.lastName)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm truncate max-w-32">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-600 truncate max-w-32">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 md:px-6 py-3 hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:translate-x-2 group/item border-l-4 border-transparent hover:border-purple-400"
                    onClick={closeAccountDropdown}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 transition-all duration-200 group-hover/item:scale-125 group-hover/item:text-purple-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
                    </svg>
                    <span className="group-hover/item:text-purple-600 transition-colors duration-200">Profile</span>
                  </Link>
                  <Link
                    href="/borrowed"
                    className="flex items-center gap-2 px-4 md:px-6 py-3 hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:translate-x-2 group/item border-l-4 border-transparent hover:border-amber-400"
                    onClick={closeAccountDropdown}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 transition-all duration-200 group-hover/item:scale-125 group-hover/item:text-amber-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <span className="group-hover/item:text-amber-600 transition-colors duration-200">Borrow Requests</span>
                  </Link>
                  <Link
                    href="/my-books"
                    className="flex items-center gap-2 px-4 md:px-6 py-3 hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:translate-x-2 group/item border-l-4 border-transparent hover:border-green-400"
                    onClick={closeAccountDropdown}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 transition-all duration-200 group-hover/item:scale-125 group-hover/item:text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                    </svg>
                    <span className="group-hover/item:text-green-600 transition-colors duration-200">My Books</span>
                  </Link>
                  <Link
                    href="/fines"
                    className="flex items-center gap-2 px-4 md:px-6 py-3 hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:translate-x-2 group/item border-l-4 border-transparent hover:border-red-400"
                    onClick={closeAccountDropdown}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 transition-all duration-200 group-hover/item:scale-125 group-hover/item:text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span className="group-hover/item:text-red-600 transition-colors duration-200">Fines</span>
                  </Link>
                  {user && user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 md:px-6 py-3 hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:translate-x-2 group/item border-l-4 border-transparent hover:border-amber-400"
                      onClick={closeAccountDropdown}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 transition-all duration-200 group-hover/item:scale-125 group-hover/item:text-amber-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3v7h10v-7h3a1 1 0 001-1V7M8 10V6h8v4" />
                      </svg>
                      <span className="group-hover/item:text-amber-600 transition-colors duration-200">Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 md:px-6 py-3 hover:bg-red-50 text-sky-700 hover:text-red-600 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-red-300 text-sm md:text-base transform hover:scale-105 hover:translate-x-2 group/item border-l-4 border-transparent hover:border-red-400 w-full text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 transition-all duration-200 group-hover/item:scale-125 group-hover/item:text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span className="group-hover/item:text-red-600 transition-colors duration-200">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 md:px-6 py-3 hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:translate-x-2 group/item border-l-4 border-transparent hover:border-sky-400"
                    onClick={closeAccountDropdown}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 transition-all duration-200 group-hover/item:scale-125 group-hover/item:text-sky-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3a2.25 2.25 0 01-2.25-2.25V9m7.5 0h-10.5" />
                    </svg>
                    <span className="group-hover/item:text-sky-900 transition-colors duration-200">Login</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-4 md:px-6 py-3 hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium focus-visible:ring-2 focus-visible:ring-sky-300 text-sm md:text-base transform hover:scale-105 hover:translate-x-2 group/item border-l-4 border-transparent hover:border-green-400"
                    onClick={closeAccountDropdown}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 transition-all duration-200 group-hover/item:scale-125 group-hover/item:text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75A2.25 2.25 0 0014.25 4.5h-4.5A2.25 2.25 0 007.5 6.75v3.75m9 0v6.75A2.25 2.25 0 0114.25 19.5h-4.5A2.25 2.25 0 017.5 17.25v-6.75m9 0h-10.5" />
                    </svg>
                    <span className="group-hover/item:text-green-600 transition-colors duration-200">Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2 text-sky-700 hover:bg-sky-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>
      
      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-lg shadow-lg border-b sticky top-0 z-20 overflow-hidden">
          <div className="px-4 py-3 space-y-2">
            <div className="relative group">
              <button className="w-full text-left px-3 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 text-sm" aria-haspopup="true" aria-expanded="false">
                Categories
                <svg className="w-4 h-4 transition-all duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <div className="mt-2 pl-4 space-y-1 opacity-100 visible pointer-events-auto">
                <Link href="/category/fiction" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  Fiction
                </Link>
                <Link href="/category/non-fiction" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Non-Fiction
                </Link>
                <Link href="/category/academic" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                  Academic
                </Link>
                <Link href="/category/journals" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"/></svg>
                  Journals
                </Link>
                <Link href="/category/reference" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Reference
                </Link>
                <Link href="/category/digital" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-50 text-sky-700 transition-all duration-200 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  Digital Books
                </Link>
              </div>
            </div>
            <Link
              href="/books"
              className="block px-3 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Books
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm text-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {user && user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="block px-3 py-2 rounded-xl text-sky-700 font-semibold hover:bg-sky-100 hover:text-sky-900 transition-all duration-200 shadow-sm text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            {user && user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="block px-3 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-all duration-200 shadow-sm text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
