"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
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

export default function CategoryPage() {
  const { user } = useAuth()
  const { fetchUnreadCount } = useNotifications()
  const params = useParams()
  const slug = params?.slug as string

  const [books, setBooks] = useState<Book[]>([])
  const [category, setCategory] = useState<Category | null>(null)
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
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showBookModal, setShowBookModal] = useState(false)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [borrowReason, setBorrowReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, sortBy, sortOrder])

  // Fetch category details
  const fetchCategory = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      
      const data = await response.json()
      const foundCategory = data.categories.find((cat: Category) => 
        cat.name.toLowerCase().replace(/\s+/g, '-') === slug
      )
      
      if (foundCategory) {
        setCategory(foundCategory)
      } else {
        setError('Category not found')
      }
    } catch (err) {
      console.error('Error fetching category:', err)
      setError('Failed to load category')
    }
  }

  const fetchBooks = async () => {
    if (!category) return
    
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
        category: category.id,
        sortBy,
        sortOrder,
      })

      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery)
      }

      const response = await fetch(`/api/books?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch books')
      }

      const data = await response.json()
      setBooks(data.books)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error fetching books:', err)
      setError('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategory()
  }, [slug])

  useEffect(() => {
    if (category) {
      fetchBooks()
    }
  }, [category, currentPage, debouncedSearchQuery, sortBy, sortOrder])

  const toggleFavorite = (bookId: string) => {
    const newFavorites = favorites.includes(bookId)
      ? favorites.filter(id => id !== bookId)
      : [...favorites, bookId]
    
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('favorites-updated', { detail: { count: newFavorites.length } }))
    }
  }

  const openBookModal = (book: Book) => {
    setSelectedBook(book)
    setShowBookModal(true)
  }

  const handleBorrowRequest = async () => {
    if (!selectedBook || !user) return

    setSubmitting(true)
    try {
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
        
        // Refresh notification count as a new notification was created
        fetchUnreadCount()
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

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes('fiction')) return '📚'
    if (name.includes('academic')) return '🎓'
    if (name.includes('journal')) return '📰'
    if (name.includes('reference')) return '📑'
    if (name.includes('digital')) return '💻'
    return '📖'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Category Banner */}
      <div className="relative min-h-[400px] bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-indigo-300/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        {/* Banner content */}
        <div className="relative z-10 flex items-center justify-center min-h-[400px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6 text-6xl md:text-8xl animate-bounce">
              {getCategoryIcon(category.name)}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {category.name}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
              {category.description || `Discover amazing books in our ${category.name} collection`}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/30">
                <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xl font-extrabold text-gray-900 tracking-wide">{category._count.books} Books Available</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(239 246 255)" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Sort Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="title">Sort by Title</option>
                <option value="author">Sort by Author</option>
                <option value="publishedYear">Sort by Year</option>
                <option value="createdAt">Sort by Date Added</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">
              {searchQuery ? `No books match "${searchQuery}" in this category.` : 'No books available in this category yet.'}
            </p>
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
                                  ? "bg-pink-100 text-pink-600 hover:bg-pink-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              <svg className="w-4 h-4" fill={favorites.includes(book.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {favorites.includes(book.id) ? 'Favorited' : 'Add to Favorites'}
                            </button>
                          </>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-sm text-gray-500 mb-2">Login to borrow books</p>
                            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                              Sign In →
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
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Book Details Modal */}
      {showBookModal && selectedBook && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setShowBookModal(false)}
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
                  onClick={() => setShowBookModal(false)}
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
                          <div className="flex-1 py-3 px-6 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 text-center">
                            Login to Borrow
                          </div>
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