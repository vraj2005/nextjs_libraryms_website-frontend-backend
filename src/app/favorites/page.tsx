"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Sample books data (in a real app, this would come from an API or database)
const allBooks = [
  {
    id: 1,
    title: "The Great Library",
    author: "Dr. Elena Richardson",
    category: "Academic",
    image: "/book-1.svg",
    rating: 4.8,
    status: "Available",
    description: "A comprehensive guide to modern library science and information management.",
    publishYear: 2023,
    isbn: "978-0123456789",
    pages: 320,
    language: "English"
  },
  {
    id: 2,
    title: "Digital Transformation",
    author: "Prof. Michael Chen",
    category: "Technology",
    image: "/book-2.svg",
    rating: 4.9,
    status: "Available",
    description: "Understanding the impact of digital technology on modern society.",
    publishYear: 2024,
    isbn: "978-0987654321",
    pages: 256,
    language: "English"
  },
  {
    id: 3,
    title: "Research Methodology",
    author: "Dr. Sarah Williams",
    category: "Academic",
    image: "/book-3.svg",
    rating: 4.7,
    status: "Reserved",
    description: "Essential guide for academic research and scholarly writing.",
    publishYear: 2023,
    isbn: "978-0456789123",
    pages: 384,
    language: "English"
  },
  {
    id: 4,
    title: "Modern Literature",
    author: "James Patterson",
    category: "Fiction",
    image: "/book-4.svg",
    rating: 4.6,
    status: "Available",
    description: "A collection of contemporary literary works and analysis.",
    publishYear: 2024,
    isbn: "978-0234567891",
    pages: 292,
    language: "English"
  },
  {
    id: 5,
    title: "Data Science Fundamentals",
    author: "Dr. Lisa Zhang",
    category: "Technology",
    image: "/book-5.svg",
    rating: 4.9,
    status: "Available",
    description: "Complete guide to data science, analytics, and machine learning.",
    publishYear: 2024,
    isbn: "978-0345678912",
    pages: 448,
    language: "English"
  },
  {
    id: 6,
    title: "Environmental Studies",
    author: "Prof. David Green",
    category: "Science",
    image: "/book-6.svg",
    rating: 4.5,
    status: "Checked Out",
    description: "Comprehensive study of environmental science and sustainability.",
    publishYear: 2023,
    isbn: "978-0567891234",
    pages: 376,
    language: "English"
  },
  {
    id: 7,
    title: "Philosophy of Mind",
    author: "Dr. Rebecca Moore",
    category: "Philosophy",
    image: "/book-1.svg",
    rating: 4.4,
    status: "Available",
    description: "Exploring consciousness, thought, and the nature of mind.",
    publishYear: 2023,
    isbn: "978-0678912345",
    pages: 302,
    language: "English"
  },
  {
    id: 8,
    title: "Quantum Physics Explained",
    author: "Prof. Alan Cooper",
    category: "Science",
    image: "/book-2.svg",
    rating: 4.8,
    status: "Available",
    description: "Making quantum mechanics accessible to everyone.",
    publishYear: 2024,
    isbn: "978-0789123456",
    pages: 334,
    language: "English"
  },
  {
    id: 9,
    title: "Creative Writing Workshop",
    author: "Emma Thompson",
    category: "Fiction",
    image: "/book-3.svg",
    rating: 4.5,
    status: "Reserved",
    description: "A practical guide to developing your writing skills.",
    publishYear: 2023,
    isbn: "978-0891234567",
    pages: 268,
    language: "English"
  },
  {
    id: 10,
    title: "Machine Learning Mastery",
    author: "Dr. Kevin Johnson",
    category: "Technology",
    image: "/book-4.svg",
    rating: 4.9,
    status: "Available",
    description: "Advanced techniques in artificial intelligence and machine learning.",
    publishYear: 2024,
    isbn: "978-0912345678",
    pages: 512,
    language: "English"
  }
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<typeof allBooks>([]);
  const [sortBy, setSortBy] = useState<"title" | "author" | "rating" | "year">("title");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favIds = JSON.parse(savedFavorites);
      setFavorites(favIds);
      setFavoriteBooks(allBooks.filter(book => favIds.includes(book.id)));
    }
  }, []);

  const toggleFavorite = (bookId: number) => {
    const updatedFavorites = favorites.includes(bookId)
      ? favorites.filter(id => id !== bookId)
      : [...favorites, bookId];
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setFavoriteBooks(allBooks.filter(book => updatedFavorites.includes(book.id)));
  };

  // Filter and sort books
  const filteredAndSortedBooks = favoriteBooks
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterBy === "all" || book.category.toLowerCase() === filterBy.toLowerCase();
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "author":
          return a.author.localeCompare(b.author);
        case "rating":
          return b.rating - a.rating;
        case "year":
          return b.publishYear - a.publishYear;
        default:
          return 0;
      }
    });

  const categories = [...new Set(favoriteBooks.map(book => book.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-r from-pink-600 via-red-500 to-pink-600">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/20 via-red-800/20 to-pink-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <svg className="w-6 h-6 text-pink-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="text-pink-100 font-medium">Your Personal Collection</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            My Favorite Books
          </h1>
          <p className="text-pink-100 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover and manage your curated collection of beloved books. Keep track of the titles that inspire, educate, and entertain you.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-pink-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <span className="font-semibold">{favoriteBooks.length} Books</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-pink-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              </svg>
              <span className="font-semibold">{categories.length} Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border border-pink-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Search */}
              <div className="md:col-span-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search Books</label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Search titles, authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent text-gray-700 pl-10"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                </div>
              </div>

              {/* Filter by Category */}
              <div>
                <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                <select
                  id="filter"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent text-gray-700"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "title" | "author" | "rating" | "year")}
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent text-gray-700"
                >
                  <option value="title">Title (A-Z)</option>
                  <option value="author">Author (A-Z)</option>
                  <option value="rating">Rating (High to Low)</option>
                  <option value="year">Year (Newest First)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {favoriteBooks.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 md:py-24">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">No Favorites Yet</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Start building your personal library by adding books to your favorites. Click the heart icon on any book to add it here!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  Browse Books
                </Link>
              </div>
            </div>
          ) : filteredAndSortedBooks.length === 0 ? (
            /* No Results State */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">No Matching Books</h2>
                <p className="text-gray-600 mb-6">
                  No books match your current search and filter criteria. Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterBy("all");
                    setSortBy("title");
                  }}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            /* Books Grid */
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {filteredAndSortedBooks.length} {filteredAndSortedBooks.length === 1 ? 'Book' : 'Books'} Found
                </h2>
                <div className="text-sm text-gray-600">
                  Showing {filteredAndSortedBooks.length} of {favoriteBooks.length} favorites
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {filteredAndSortedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-pink-100 group"
                  >
                    <div className="relative h-56 md:h-64">
                      <Image
                        src={book.image}
                        alt={book.title}
                        fill
                        className="object-contain bg-gradient-to-br from-pink-50 to-red-50"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => toggleFavorite(book.id)}
                          className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200 transform hover:scale-110 shadow-lg"
                          aria-label="Remove from favorites"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            book.status === "Available"
                              ? "bg-green-100 text-green-800"
                              : book.status === "Reserved"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {book.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 md:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-pink-600 text-xs md:text-sm font-medium bg-pink-100 px-2 py-1 rounded-full">
                          {book.category}
                        </span>
                        <span className="text-gray-500 text-xs md:text-sm">{book.publishYear}</span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 mb-2 text-sm md:text-base">by {book.author}</p>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{book.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Pages: {book.pages}</span>
                          <span>{book.language}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-gray-700 font-semibold text-sm md:text-base">{book.rating}</span>
                          </div>
                          <button
                            className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                              book.status === "Available"
                                ? "bg-pink-600 hover:bg-pink-700 text-white"
                                : book.status === "Reserved"
                                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                : "bg-gray-400 text-gray-200 cursor-not-allowed"
                            }`}
                            disabled={book.status === "Checked Out"}
                          >
                            {book.status === "Available" ? "Borrow" : book.status === "Reserved" ? "Join Queue" : "Unavailable"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      {favoriteBooks.length > 0 && (
        <section className="py-12 md:py-16 bg-gradient-to-r from-pink-50 via-white to-red-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Manage Your Collection</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Take action on your favorite books with these quick options
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/borrowed"
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-pink-100"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">Check Borrowed Books</h3>
                <p className="text-gray-600">See which of your favorites you currently have borrowed</p>
              </Link>

              <button
                onClick={() => {
                  const availableFavorites = favoriteBooks.filter(book => book.status === "Available");
                  if (availableFavorites.length > 0) {
                    alert(`You can borrow ${availableFavorites.length} of your favorite books right now!`);
                  } else {
                    alert("None of your favorite books are currently available for borrowing.");
                  }
                }}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-pink-100"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">Check Availability</h3>
                <p className="text-gray-600">See which favorites are available to borrow right now</p>
              </button>

              <button
                onClick={() => {
                  setFavorites([]);
                  setFavoriteBooks([]);
                  localStorage.removeItem('favorites');
                }}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-pink-100"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">Clear All Favorites</h3>
                <p className="text-gray-600">Remove all books from your favorites list</p>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
