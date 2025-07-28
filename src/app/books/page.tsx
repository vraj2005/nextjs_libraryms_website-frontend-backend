'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

interface Book {
  id: string
  title: string
  author: string
  description?: string
  isbn: string
  totalCopies: number
  availableCopies: number
  publishedYear?: number
  publisher?: string
  image?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    description?: string
    image?: string
  }
}

interface Category {
  id: string
  name: string
  description?: string
  image?: string
  _count: {
    books: number
  }
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalBooks: number
  limit: number
}

export default function BooksPage() {
  const { user } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0,
    limit: 12
  })
  
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showBookModal, setShowBookModal] = useState(false)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [borrowReason, setBorrowReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const booksPerPage = 8

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, selectedCategory, selectedStatus, sortBy, sortOrder])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: booksPerPage.toString(),
        sortBy,
        sortOrder
      })

      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus === 'available' ? 'available' : 'unavailable')
      }

      const response = await fetch(`/api/books?${params}`)
      const data = await response.json()

      if (response.ok) {
        let filteredBooks = data.books

        // Client-side filtering for availability since API might not support it
        if (selectedStatus === 'available') {
          filteredBooks = data.books.filter((book: Book) => book.availableCopies > 0)
        } else if (selectedStatus === 'unavailable') {
          filteredBooks = data.books.filter((book: Book) => book.availableCopies === 0)
        }

        setBooks(filteredBooks)
        setPagination({
          ...data.pagination,
          totalBooks: filteredBooks.length
        })
      } else {
        setError(data.error || 'Failed to fetch books')
      }
    } catch (error) {
      setError('Failed to fetch books')
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (response.ok) {
        setCategories(data.categories)
      } else {
        console.error('Failed to fetch categories:', data.error)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [currentPage, debouncedSearchQuery, selectedCategory, selectedStatus, sortBy, sortOrder])

  const toggleFavorite = (bookId: string) => {
    const updatedFavorites = favorites.includes(bookId)
      ? favorites.filter(id => id !== bookId)
      : [...favorites, bookId]
    
    setFavorites(updatedFavorites)
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
  }

  const handleBorrowRequest = async () => {
    if (!selectedBook || !user) return

    try {
      setSubmitting(true)
      const response = await fetch('/api/borrow-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          bookId: selectedBook.id,
          reason: borrowReason
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Show success message
        alert('✅ Borrow request submitted successfully!\n\nYour request has been sent to the admin for review. You will receive a notification once the admin makes a decision.\n\nCheck your notifications regularly for updates.')
        
        setShowBorrowModal(false)
        setBorrowReason('')
        setSelectedBook(null)
        setShowBookModal(false)
        
        // Refresh books to update any changes
        fetchBooks()
      } else {
        // Show specific error message
        const errorMessage = data.error || 'Failed to submit borrow request'
        if (errorMessage.includes('already have a pending')) {
          alert('⚠️ Request Already Exists\n\nYou already have a pending or active request for this book. Please check your borrow requests or wait for the current request to be processed.')
        } else if (errorMessage.includes('No copies available')) {
          alert('❌ Book Unavailable\n\nSorry, there are no copies of this book available for borrowing at the moment. Please try again later.')
        } else {
          alert(`❌ Request Failed\n\n${errorMessage}`)
        }
      }
    } catch (error) {
      console.error('Error submitting borrow request:', error)
      alert('❌ Network Error\n\nFailed to submit borrow request. Please check your internet connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddToFavorites = async (bookId: string) => {
    if (!user) {
      alert('Please login to add books to favorites')
      return
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ bookId })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Book added to favorites!')
        toggleFavorite(bookId)
      } else {
        alert(data.error || 'Failed to add to favorites')
      }
    } catch (error) {
      console.error('Error adding to favorites:', error)
      alert('Failed to add to favorites')
    }
  }

  const openBookModal = (book: Book) => {
    setSelectedBook(book)
    setShowBookModal(true)
  }

  const closeBookModal = () => {
    setShowBookModal(false)
    setSelectedBook(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading books...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={fetchBooks}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-indigo-800/20 to-purple-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span className="text-blue-100 font-medium">Complete Collection</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Explore Our Books
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover thousands of books across multiple categories. Search, filter, and find detailed information about every book in our comprehensive digital library.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-blue-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <span className="font-semibold">{pagination.totalBooks} Total Books</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-blue-100">
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
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Search */}
              <div className="lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search Books</label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by title, author, subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-gray-700 pl-10 pr-10"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                  {searchQuery !== debouncedSearchQuery && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-gray-700"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Not Available</option>
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-2">Sort by:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
                  >
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="publishYear">Year</option>
                    <option value="rating">Rating</option>
                    <option value="pages">Pages</option>
                  </select>
                </div>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                  </span>
                  <svg className={`w-4 h-4 text-blue-600 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Showing {books.length} of {pagination.totalBooks} books
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {books.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">No Books Found</h2>
              <p className="text-gray-600 mb-6">
                No books match your current search and filter criteria. Try adjusting your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setSortBy("title");
                  setSortOrder("asc");
                  setCurrentPage(1);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {books.map((book) => (
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
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-all duration-200 flex-shrink-0 ${
                                  favorites.includes(book.id)
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                                }`}
                                aria-label={favorites.includes(book.id) ? "Remove from favorites" : "Add to favorites"}
                              >
                                <svg className="w-4 h-4 flex-shrink-0" fill={favorites.includes(book.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="text-sm font-medium truncate">
                                  {favorites.includes(book.id) ? "Favorited" : "Add to Favorites"}
                                </span>
                              </button>
                            </>
                          ) : (
                            <div className="text-center flex-shrink-0">
                              <p className="text-sm text-gray-500 mb-2">Login to borrow books</p>
                              <a
                                href="/login"
                                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                Login
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white border border-blue-200 text-gray-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-blue-200 text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 rounded-lg bg-white border border-blue-200 text-gray-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Book Details Modal */}
      {showBookModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
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
                        src={selectedBook!.image || '/book-placeholder.jpg'}
                        alt={selectedBook!.title}
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
                          <span className="font-bold text-gray-900">{selectedBook!.totalCopies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 font-medium">Available:</span>
                          <span className="font-bold text-green-600">{selectedBook!.availableCopies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 font-medium">Borrowed:</span>
                          <span className="font-bold text-blue-600">{selectedBook!.totalCopies - selectedBook!.availableCopies}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Book Information */}
                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      {/* Title and Author */}
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedBook!.title}</h1>
                        <p className="text-xl text-gray-600 mb-4">by {selectedBook!.author}</p>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold text-gray-900">ISBN: {selectedBook!.isbn}</span>
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            selectedBook!.availableCopies > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {selectedBook!.availableCopies > 0 ? "Available" : "Not Available"}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                        <p className="text-gray-800 leading-relaxed text-base">{selectedBook!.description}</p>
                      </div>

                      {/* Book Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Publication Details</h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Publisher:</span>
                              <span className="font-semibold text-gray-900">{selectedBook!.publisher || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Year:</span>
                              <span className="font-semibold text-gray-900">{selectedBook!.publishedYear || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">ISBN:</span>
                              <span className="font-semibold text-gray-900 font-mono text-xs">{selectedBook!.isbn}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Active:</span>
                              <span className="font-semibold text-gray-900">{selectedBook!.isActive ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Library Information</h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Category:</span>
                              <span className="font-semibold text-gray-900">{selectedBook!.category.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Total Copies:</span>
                              <span className="font-semibold text-gray-900">{selectedBook!.totalCopies}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Available:</span>
                              <span className="font-semibold text-green-600">{selectedBook!.availableCopies}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Status:</span>
                              <span className={`font-semibold ${selectedBook!.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedBook!.availableCopies > 0 ? 'Available' : 'Not Available'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => {
                            if (selectedBook!.availableCopies > 0) {
                              setShowBorrowModal(true)
                            }
                          }}
                          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                            selectedBook!.availableCopies > 0
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                          disabled={selectedBook!.availableCopies === 0}
                        >
                          {selectedBook!.availableCopies > 0 ? "Request to Borrow" : "Currently Unavailable"}
                        </button>
                        
                        <button
                          onClick={() => toggleFavorite(selectedBook!.id)}
                          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                            favorites.includes(selectedBook!.id)
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-500"
                          }`}
                        >
                          <svg className="w-5 h-5" fill={favorites.includes(selectedBook!.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {favorites.includes(selectedBook!.id) ? "Remove from Favorites" : "Add to Favorites"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Borrow Modal */}
      {showBorrowModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
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
              <h4 className="font-bold text-gray-900 mb-1">{selectedBook!.title}</h4>
              <p className="text-sm text-gray-600 mb-2">by {selectedBook!.author}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ISBN: {selectedBook!.isbn}</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {selectedBook!.availableCopies} available
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
                onClick={handleBorrowRequest}
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
  )
}
