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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative">
              <button
                onClick={() => setShowBookModal(false)}
                className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 p-6">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={selectedBook.image || '/book-placeholder.jpg'}
                      alt={selectedBook.title}
                      fill
                      className="object-contain rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="md:w-2/3 p-6">
                  <div className="mb-4">
                    <span className="text-blue-600 text-sm font-medium bg-blue-100 px-3 py-1 rounded-full">
                      {selectedBook.category.name}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedBook.title}</h2>
                  <p className="text-xl text-gray-600 mb-4">by {selectedBook.author}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">ISBN:</span>
                      <span className="ml-2 text-gray-600">{selectedBook.isbn}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Published:</span>
                      <span className="ml-2 text-gray-600">{selectedBook.publishedYear || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Publisher:</span>
                      <span className="ml-2 text-gray-600">{selectedBook.publisher || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Available:</span>
                      <span className="ml-2 text-gray-600">{selectedBook.availableCopies}/{selectedBook.totalCopies}</span>
                    </div>
                  </div>
                  
                  {selectedBook.description && (
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedBook.description}</p>
                    </div>
                  )}
                  
                  {user && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowBookModal(false);
                          setShowBorrowModal(true);
                        }}
                        disabled={selectedBook.availableCopies === 0}
                        className={`flex-1 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                          selectedBook.availableCopies > 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {selectedBook.availableCopies > 0 ? 'Request to Borrow' : 'Not Available'}
                      </button>
                      
                      <button
                        onClick={() => toggleFavorite(selectedBook.id)}
                        className={`px-6 py-3 rounded-full transition-all duration-200 ${
                          favorites.includes(selectedBook.id)
                            ? "bg-pink-100 text-pink-600 hover:bg-pink-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <svg className="w-5 h-5" fill={favorites.includes(selectedBook.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Borrow Request Modal */}
      {showBorrowModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request to Borrow</h3>
            <p className="text-gray-600 mb-4">
              You are requesting to borrow <span className="font-medium">"{selectedBook.title}"</span>
            </p>
            
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for borrowing (optional)
              </label>
              <textarea
                id="reason"
                value={borrowReason}
                onChange={(e) => setBorrowReason(e.target.value)}
                placeholder="e.g., for research, coursework, personal reading..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowBorrowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBorrowRequest}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}