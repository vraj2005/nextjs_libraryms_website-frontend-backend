"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  publishedYear?: number;
  publisher?: string;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    description?: string;
    image?: string;
  };
}

const slides = [
  {
    id: 1,
    title: "Welcome to LibraryMS",
    subtitle: "Your Digital Library at Your Fingertips",
    description: "Discover thousands of books, journals, and digital resources available 24/7. Your journey to knowledge starts here.",
    bgImage: "/library-interior.svg",
    cta: "Browse Collection",
    ctaLink: "/books"
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
    name: "Journals",
    description: "Research & scientific journals",
    icon: "�",
    count: "1,550",
    color: "from-orange-400 to-orange-600",
    link: "/category/journals"
  },
  {
    id: 5,
    name: "Digital Books",
    description: "E-books & digital resources",
    icon: "💻",
    count: "980",
    color: "from-pink-400 to-pink-600",
    link: "/category/digital"
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

export default function HomePage() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [realCategories, setRealCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [featuredBooksLoading, setFeaturedBooksLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowReason, setBorrowReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Fetch featured books from API
  const fetchFeaturedBooks = async () => {
    try {
      setFeaturedBooksLoading(true);
      const response = await fetch('/api/books?featured=true&limit=6');
      if (response.ok) {
        const data = await response.json();
        setFeaturedBooks(data.books || []);
      } else {
        console.error('Failed to fetch featured books');
        setFeaturedBooks([]);
      }
    } catch (error) {
      console.error('Error fetching featured books:', error);
      setFeaturedBooks([]);
    } finally {
      setFeaturedBooksLoading(false);
    }
  };

  // Fetch real categories with book counts
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        
        // Map API categories to the format expected by the UI
        const mappedCategories = data.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || `Browse ${cat.name.toLowerCase()} books`,
          icon: getCategoryIcon(cat.name),
          count: cat._count.books,
          color: getCategoryColor(cat.name),
          link: `/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`
        }));
        
        setRealCategories(mappedCategories);
      } else {
        // Fallback to static categories if API fails
        setRealCategories(categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to static categories if API fails
      setRealCategories(categories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Helper function to get category icon
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('fiction')) return '📚';
    if (name.includes('academic')) return '🎓';
    if (name.includes('journal')) return '📰';
    if (name.includes('reference')) return '📑';
    if (name.includes('digital')) return '💻';
    if (name.includes('science')) return '🔬';
    if (name.includes('history')) return '📜';
    if (name.includes('art')) return '🎨';
    if (name.includes('technology')) return '⚡';
    if (name.includes('business')) return '💼';
    return '📖';
  };

  // Helper function to get category color
  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('fiction')) return 'from-purple-400 to-purple-600';
    if (name.includes('academic')) return 'from-blue-400 to-blue-600';
    if (name.includes('journal')) return 'from-orange-400 to-orange-600';
    if (name.includes('reference')) return 'from-red-400 to-red-600';
    if (name.includes('digital')) return 'from-pink-400 to-pink-600';
    if (name.includes('science')) return 'from-green-400 to-green-600';
    if (name.includes('history')) return 'from-yellow-400 to-yellow-600';
    if (name.includes('art')) return 'from-indigo-400 to-indigo-600';
    if (name.includes('technology')) return 'from-cyan-400 to-cyan-600';
    if (name.includes('business')) return 'from-emerald-400 to-emerald-600';
    return 'from-gray-400 to-gray-600';
  };

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load favorites from localStorage and fetch categories
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    // Fetch real categories from API
    fetchCategories();
    // Fetch featured books from API
    fetchFeaturedBooks();
  }, []);

  const toggleFavorite = (bookId: string) => {
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
    // Redirect to books page with search query
    if (searchQuery.trim()) {
      window.location.href = `/books?search=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      window.location.href = '/books';
    }
  };

  const openBookModal = (book: Book) => {
    setSelectedBook(book);
    setShowBookModal(true);
  };

  const closeBookModal = () => {
    setShowBookModal(false);
    setSelectedBook(null);
  };

  const requestBorrow = async () => {
    if (!user || !selectedBook) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');

      const response = await fetch('/api/borrow-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: selectedBook.id,
          notes: borrowReason
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Borrow request submitted successfully!');
        setShowBorrowModal(false);
        setBorrowReason('');
        // Refresh featured books to update availability
        fetchFeaturedBooks();
      } else {
        alert(data.error || 'Failed to submit borrow request');
      }
    } catch (error) {
      console.error('Error submitting borrow request:', error);
      alert('Failed to submit borrow request');
    } finally {
      setSubmitting(false);
    }
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
            {categoriesLoading ? (
              // Loading skeleton
              [...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-sky-100 animate-pulse"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-300 rounded-2xl mb-4 md:mb-6"></div>
                  <div className="h-6 md:h-8 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              realCategories.map((category) => (
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
                    <span className="text-sky-700 font-semibold text-sm md:text-base">
                      {category.count} {category.count === 1 ? 'book' : 'books'}
                    </span>
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-sky-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </Link>
              ))
            )}
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
          
          {featuredBooksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-blue-100 animate-pulse"
                >
                  <div className="h-64 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredBooks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Featured Books</h3>
              <p className="text-gray-500 mb-6">No books are currently featured. Check back later!</p>
              <Link
                href="/books"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Browse All Books
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 group cursor-pointer flex flex-col h-full"
                  onClick={() => openBookModal(book)}
                >
                  <div className="relative h-56 md:h-64 flex-shrink-0">
                    <Image
                      src={book.image || '/book-placeholder.jpg'}
                      alt={book.title}
                      fill
                      className="object-contain bg-gradient-to-br from-blue-50 to-indigo-50"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/book-placeholder.jpg'
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          book.availableCopies > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {book.availableCopies > 0 ? "Available" : "Not Available"}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                        <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-700">{book.availableCopies}/{book.totalCopies}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                      <span className="text-blue-600 text-xs md:text-sm font-medium bg-blue-100 px-2 py-1 rounded-full truncate">
                        {book.category.name}
                      </span>
                      <span className="text-gray-500 text-xs md:text-sm flex-shrink-0">{book.publishedYear}</span>
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors flex-shrink-0" 
                        title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-gray-600 mb-2 text-sm md:text-base flex-shrink-0 truncate" title={`by ${book.author}`}>
                      by {book.author}
                    </p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow" title={book.description}>
                      {book.description}
                    </p>
                    
                    <div className="space-y-3 flex-shrink-0">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="truncate" title={`ISBN: ${book.isbn}`}>ISBN: {book.isbn}</span>
                        <span className="truncate text-right" title={book.publisher || 'Unknown Publisher'}>
                          {book.publisher || 'Unknown Publisher'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Available: {book.availableCopies}/{book.totalCopies}</span>
                        <span className="font-semibold text-blue-600">
                          {book.availableCopies > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                        {user ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBook(book);
                                setShowBorrowModal(true);
                              }}
                              disabled={book.availableCopies === 0}
                              className={`w-full px-4 py-2 rounded-full font-medium transition-all duration-200 flex-shrink-0 ${
                                book.availableCopies > 0
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              {book.availableCopies > 0 ? 'Request to Borrow' : 'Not Available'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(book.id);
                              }}
                              className={`w-full px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                favorites.includes(book.id)
                                  ? "bg-red-500 text-white hover:bg-red-600"
                                  : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                              }`}
                            >
                              <svg className="w-4 h-4" fill={favorites.includes(book.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {favorites.includes(book.id) ? 'Favorited' : 'Add to Favorites'}
                            </button>
                          </>
                        ) : (
                          <Link
                            href="/login"
                            className="w-full px-4 py-2 rounded-full font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Login to Borrow
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
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

      {/* Book Details Modal */}
      {showBookModal && selectedBook && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={closeBookModal}
        >
          <div 
            className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Book Details</h2>
                <button
                  onClick={closeBookModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Book Image */}
                  <div className="lg:col-span-1">
                    <div className="relative h-80 lg:h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={selectedBook.image || '/book-placeholder.jpg'}
                        alt={selectedBook.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    </div>
                    
                    {/* Availability Status */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-gray-900 mb-3 text-base">Availability Status</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700 font-medium">Total Copies:</span>
                          <span className="font-bold text-gray-900">{selectedBook.totalCopies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 font-medium">Available:</span>
                          <span className="font-bold text-green-600">{selectedBook.availableCopies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 font-medium">Borrowed:</span>
                          <span className="font-bold text-blue-600">{selectedBook.totalCopies - selectedBook.availableCopies}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Book Information */}
                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      {/* Title and Author */}
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedBook.title}</h1>
                        <p className="text-xl text-gray-600 mb-4">by {selectedBook.author}</p>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold text-gray-900">ISBN: {selectedBook.isbn}</span>
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            selectedBook.availableCopies > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {selectedBook.availableCopies > 0 ? "Available" : "Not Available"}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                        <p className="text-gray-800 leading-relaxed text-base">{selectedBook.description || 'No description available.'}</p>
                      </div>

                      {/* Book Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Publication Details</h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Publisher:</span>
                              <span className="font-semibold text-gray-900">{selectedBook.publisher || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Year:</span>
                              <span className="font-semibold text-gray-900">{selectedBook.publishedYear || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">ISBN:</span>
                              <span className="font-semibold text-gray-900 font-mono text-xs">{selectedBook.isbn}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Active:</span>
                              <span className="font-semibold text-gray-900">{selectedBook.isActive ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Library Information</h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Category:</span>
                              <span className="font-semibold text-gray-900">{selectedBook.category.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Total Copies:</span>
                              <span className="font-semibold text-gray-900">{selectedBook.totalCopies}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Available:</span>
                              <span className="font-semibold text-green-600">{selectedBook.availableCopies}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Status:</span>
                              <span className={`font-semibold ${selectedBook.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedBook.availableCopies > 0 ? 'Available' : 'Not Available'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                        {user ? (
                          <>
                            <button
                              onClick={() => {
                                if (selectedBook.availableCopies > 0) {
                                  setShowBookModal(false);
                                  setShowBorrowModal(true);
                                }
                              }}
                              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                                selectedBook.availableCopies > 0
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
                              }`}
                              disabled={selectedBook.availableCopies === 0}
                            >
                              {selectedBook.availableCopies > 0 ? "Request to Borrow" : "Currently Unavailable"}
                            </button>
                            
                            <button
                              onClick={() => toggleFavorite(selectedBook.id)}
                              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                favorites.includes(selectedBook.id)
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-500"
                              }`}
                            >
                              <svg className="w-5 h-5" fill={favorites.includes(selectedBook.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {favorites.includes(selectedBook.id) ? "Remove from Favorites" : "Add to Favorites"}
                            </button>
                          </>
                        ) : (
                          <Link
                            href="/login"
                            className="flex-1 py-3 px-6 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 text-center"
                          >
                            Login to Borrow
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Borrow Request Modal */}
      {showBorrowModal && selectedBook && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setShowBorrowModal(false)}
        >
          <div 
            className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Request to Borrow</h3>
                <p className="text-sm text-gray-600">Submit your borrowing request</p>
              </div>
            </div>
            
            {/* Book Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
              <h4 className="font-bold text-gray-900 mb-1">{selectedBook.title}</h4>
              <p className="text-sm text-gray-600 mb-2">by {selectedBook.author}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ISBN: {selectedBook.isbn}</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {selectedBook.availableCopies} available
                </span>
              </div>
            </div>

            {/* Request Form */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Reason for borrowing <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea
                value={borrowReason}
                onChange={(e) => setBorrowReason(e.target.value)}
                placeholder="e.g., Research for assignment, Personal reading, Course requirement..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-base leading-relaxed resize-none"
              />
              <p className="mt-2 text-xs text-gray-600">
                💡 Providing a reason helps the librarian understand your academic or research needs and may expedite approval.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="text-xs space-y-1">
                    <li>• Your request will be sent to the library admin</li>
                    <li>• You'll receive a notification with the decision</li>
                    <li>• If approved, you'll have 14 days to return the book</li>
                    <li>• Late returns may incur fines</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowBorrowModal(false)
                  setBorrowReason('')
                  setSelectedBook(null)
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={requestBorrow}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
