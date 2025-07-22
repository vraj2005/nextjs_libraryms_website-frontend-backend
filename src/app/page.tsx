"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    id: 1,
    title: "Welcome to LibraryMS",
    subtitle: "Your Digital Library at Your Fingertips",
    description: "Discover thousands of books, journals, and digital resources available 24/7. Your journey to knowledge starts here.",
    bgImage: "/library-interior.svg",
    cta: "Browse Collection",
    ctaLink: "/browse"
  },
  {
    id: 2,
    title: "Academic Excellence",
    subtitle: "Research & Study Resources",
    description: "Access comprehensive academic materials, research papers, and scholarly articles to support your academic journey.",
    bgImage: "/academic-hero.svg",
    cta: "Academic Section",
    ctaLink: "/category/academic"
  },
  {
    id: 3,
    title: "Digital Innovation",
    subtitle: "Modern Library Experience",
    description: "Experience the future of libraries with our state-of-the-art digital platform designed for modern learners.",
    bgImage: "/library-hero.svg",
    cta: "Digital Books",
    ctaLink: "/category/digital"
  }
];

const categories = [
  {
    id: 1,
    name: "Fiction",
    description: "Novels, stories & literature",
    icon: "📚",
    count: "2,450",
    color: "from-purple-400 to-purple-600",
    link: "/category/fiction"
  },
  {
    id: 2,
    name: "Non-Fiction",
    description: "Biographies, history & more",
    icon: "📖",
    count: "1,890",
    color: "from-green-400 to-green-600",
    link: "/category/non-fiction"
  },
  {
    id: 3,
    name: "Academic",
    description: "Textbooks & study materials",
    icon: "🎓",
    count: "3,200",
    color: "from-blue-400 to-blue-600",
    link: "/category/academic"
  },
  {
    id: 4,
    name: "Science",
    description: "Research & scientific journals",
    icon: "🔬",
    count: "1,550",
    color: "from-teal-400 to-teal-600",
    link: "/category/science"
  },
  {
    id: 5,
    name: "Technology",
    description: "IT, programming & innovation",
    icon: "💻",
    count: "980",
    color: "from-indigo-400 to-indigo-600",
    link: "/category/technology"
  },
  {
    id: 6,
    name: "Reference",
    description: "Dictionaries, encyclopedias",
    icon: "📑",
    count: "750",
    color: "from-red-400 to-red-600",
    link: "/category/reference"
  }
];

const featuredBooks = [
  {
    id: 1,
    title: "The Great Library",
    author: "Dr. Elena Richardson",
    category: "Academic",
    image: "/book-1.svg",
    rating: 4.8,
    status: "Available",
    description: "A comprehensive guide to modern library science and information management.",
    publishYear: 2023
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
    publishYear: 2024
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
    publishYear: 2023
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
    publishYear: 2024
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
    publishYear: 2024
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
    publishYear: 2023
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (bookId: number) => {
    const updatedFavorites = favorites.includes(bookId)
      ? favorites.filter(id => id !== bookId)
      : [...favorites, bookId];
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Hero Slider */}
      <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden rounded-b-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/90 via-sky-800/70 to-transparent z-10"></div>
        
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
              index === currentSlide ? "translate-x-0" : index < currentSlide ? "-translate-x-full" : "translate-x-full"
            }`}
          >
            <Image
              src={slide.bgImage}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}

        <div className="absolute inset-0 z-20 flex items-center">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <div className="max-w-2xl text-white">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-light mb-6 text-sky-100">
                {slides[currentSlide].subtitle}
              </h2>
              <p className="text-base md:text-lg lg:text-xl mb-8 text-sky-50 leading-relaxed">
                {slides[currentSlide].description}
              </p>
              <Link
                href={slides[currentSlide].ctaLink}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-sky-900 font-bold py-3 md:py-4 px-6 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                {slides[currentSlide].cta}
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all duration-200"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all duration-200"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? "bg-amber-400 scale-125" : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 md:py-12 -mt-8 relative z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border border-sky-100">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search for books, authors, subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent text-sky-700 text-base md:text-lg"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
                <span className="hidden md:inline">Search</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Library Stats */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white p-4 md:p-6 rounded-2xl text-center shadow-xl">
              <div className="text-2xl md:text-4xl font-bold mb-2">15,000+</div>
              <div className="text-sky-100 text-sm md:text-base">Total Books</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-4 md:p-6 rounded-2xl text-center shadow-xl">
              <div className="text-2xl md:text-4xl font-bold mb-2">5,200+</div>
              <div className="text-amber-100 text-sm md:text-base">Active Members</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 md:p-6 rounded-2xl text-center shadow-xl">
              <div className="text-2xl md:text-4xl font-bold mb-2">850+</div>
              <div className="text-purple-100 text-sm md:text-base">Digital Resources</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 md:p-6 rounded-2xl text-center shadow-xl">
              <div className="text-2xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-green-100 text-sm md:text-base">Online Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-sky-800 mb-4">
              Browse Collections
            </h2>
            <p className="text-sky-600 text-lg md:text-xl max-w-2xl mx-auto">
              Explore our vast collection organized by categories to find exactly what you're looking for
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.link}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-sky-100 hover:border-sky-200"
              >
                <div className={`bg-gradient-to-r ${category.color} w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {category.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-sky-800 mb-2 group-hover:text-sky-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sky-600 mb-4 text-sm md:text-base">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sky-700 font-semibold text-sm md:text-base">{category.count} books</span>
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-sky-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-sky-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-sky-800 mb-4">
              Featured Books
            </h2>
            <p className="text-sky-600 text-lg md:text-xl max-w-2xl mx-auto">
              Discover our handpicked selection of must-read books and latest additions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-sky-100"
              >
                <div className="relative h-56 md:h-64 lg:h-72">
                  <Image
                    src={book.image}
                    alt={book.title}
                    fill
                    className="object-contain bg-gray-50"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4">
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sky-600 text-xs md:text-sm font-medium bg-sky-100 px-2 py-1 rounded-full">
                      {book.category}
                    </span>
                    <span className="text-gray-500 text-xs md:text-sm">{book.publishYear}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-sky-800 mb-2 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sky-600 mb-2 text-sm md:text-base">by {book.author}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{book.description}</p>
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
                          ? "bg-sky-600 hover:bg-sky-700 text-white"
                          : book.status === "Reserved"
                          ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                      disabled={book.status === "Checked Out"}
                    >
                      {book.status === "Available" ? "Borrow" : book.status === "Reserved" ? "Join Queue" : "Unavailable"}
                    </button>
                  </div>
                  <div className="flex justify-center mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggleFavorite(book.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                        favorites.includes(book.id)
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                      }`}
                      aria-label={favorites.includes(book.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg className="w-4 h-4" fill={favorites.includes(book.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm font-medium">
                        {favorites.includes(book.id) ? "Favorited" : "Add to Favorites"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 md:mt-12">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              View All Books
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-sky-800 mb-4">
              Quick Actions
            </h2>
            <p className="text-sky-600 text-lg md:text-xl max-w-2xl mx-auto">
              Access essential library services with just one click
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <Link
              href="/reserve-room"
              className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 md:p-8 rounded-2xl text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg md:text-xl font-bold mb-2">Reserve Study Room</h3>
              <p className="text-purple-100 text-sm md:text-base">Book private study spaces</p>
            </Link>
            <Link
              href="/request-book"
              className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-6 md:p-8 rounded-2xl text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <h3 className="text-lg md:text-xl font-bold mb-2">Request New Book</h3>
              <p className="text-green-100 text-sm md:text-base">Suggest books for library</p>
            </Link>
            <Link
              href="/renew-books"
              className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 md:p-8 rounded-2xl text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <h3 className="text-lg md:text-xl font-bold mb-2">Renew Books</h3>
              <p className="text-blue-100 text-sm md:text-base">Extend borrowing period</p>
            </Link>
            <Link
              href="/help"
              className="group bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 md:p-8 rounded-2xl text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg md:text-xl font-bold mb-2">Get Help</h3>
              <p className="text-orange-100 text-sm md:text-base">Contact librarian support</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
