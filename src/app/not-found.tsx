"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="not-found-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
              <rect width="20" height="20" fill="none"/>
              <text x="2" y="10" fontSize="8" fill="currentColor">📚</text>
              <text x="12" y="18" fontSize="6" fill="currentColor">?</text>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#not-found-pattern)"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            {/* Large 404 Text */}
            <div className="text-8xl md:text-9xl lg:text-[12rem] font-bold text-transparent bg-gradient-to-br from-sky-600 via-indigo-600 to-purple-600 bg-clip-text leading-none">
              404
            </div>
            
            {/* Floating Books Animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-32">
                {/* Book 1 */}
                <div className="absolute top-4 left-8 animate-float-slow">
                  <Image
                    src="/book-1.svg"
                    alt="Floating Book"
                    width={40}
                    height={50}
                    className="transform rotate-12 opacity-80"
                  />
                </div>
                {/* Book 2 */}
                <div className="absolute top-8 right-8 animate-float-medium">
                  <Image
                    src="/book-2.svg"
                    alt="Floating Book"
                    width={35}
                    height={45}
                    className="transform -rotate-12 opacity-70"
                  />
                </div>
                {/* Book 3 */}
                <div className="absolute bottom-4 left-12 animate-float-fast">
                  <Image
                    src="/book-3.svg"
                    alt="Floating Book"
                    width={30}
                    height={40}
                    className="transform rotate-6 opacity-60"
                  />
                </div>
                {/* Book 4 */}
                <div className="absolute bottom-6 right-12 animate-float-slow">
                  <Image
                    src="/book-4.svg"
                    alt="Floating Book"
                    width={38}
                    height={48}
                    className="transform -rotate-8 opacity-75"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg md:text-xl text-gray-600 mb-4">
              It looks like the page you're looking for has been moved, deleted, or doesn't exist in our library catalog.
            </p>
            <p className="text-md text-gray-500">
              Don't worry! Let's help you find what you're looking for.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/"
            className="group px-8 py-4 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg hover:from-sky-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-3"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
          
          <Link
            href="/borrowed"
            className="group px-8 py-4 border-2 border-sky-600 text-sky-600 rounded-2xl font-semibold text-lg hover:bg-sky-600 hover:text-white transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Browse Books
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Navigation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/about"
              className="group p-4 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 hover:from-sky-100 hover:to-sky-200 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl mb-2">ℹ️</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-sky-800">About Us</h4>
              <p className="text-sm text-gray-600 mt-1">Learn about our library</p>
            </Link>
            
            <Link
              href="/contact"
              className="group p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl mb-2">📞</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-green-800">Contact</h4>
              <p className="text-sm text-gray-600 mt-1">Get in touch with us</p>
            </Link>
            
            <Link
              href="/profile"
              className="group p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl mb-2">👤</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-purple-800">Profile</h4>
              <p className="text-sm text-gray-600 mt-1">Manage your account</p>
            </Link>
            
            <Link
              href="/login"
              className="group p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🔐</div>
              <h4 className="font-semibold text-gray-900 group-hover:text-amber-800">Login</h4>
              <p className="text-sm text-gray-600 mt-1">Access your account</p>
            </Link>
          </div>
        </div>

        {/* Fun Library Facts */}
        <div className="mt-12 p-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">📖 Did You Know?</h4>
          <p className="text-gray-700">
            The word "library" comes from the Latin "liber" meaning book. The oldest known library was discovered in Syria and dates back to 2500 BCE!
          </p>
        </div>

        {/* Back to Top Helper */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Error Code: 404 | Page Not Found</p>
          <p className="mt-1">If you believe this is an error, please contact our support team.</p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(-12deg); }
          50% { transform: translateY(-15px) rotate(-12deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(6deg); }
          50% { transform: translateY(-25px) rotate(6deg); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 3s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 2.5s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
