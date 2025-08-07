'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface MyBook {
  id: string
  bookId: string
  userId: string
  requestDate: string
  status: 'APPROVED' | 'RETURNED'
  approvedDate?: string
  dueDate?: string
  returnDate?: string
  notes?: string
  book: {
    id: string
    title: string
    author: string
    isbn: string
    description?: string
    publishedYear?: number
    publisher?: string
    image?: string
    category: {
      id: string
      name: string
    }
  }
}

const getStatusColor = (status: string, dueDate?: string) => {
  if (status === 'RETURNED') {
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }
  
  if (status === 'APPROVED' && dueDate) {
    const today = new Date()
    const due = new Date(dueDate)
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < 0) {
      return 'bg-red-100 text-red-800 border-red-200' // Overdue
    } else if (daysUntilDue <= 3) {
      return 'bg-orange-100 text-orange-800 border-orange-200' // Due soon
    } else {
      return 'bg-green-100 text-green-800 border-green-200' // Active
    }
  }
  
  return 'bg-green-100 text-green-800 border-green-200'
}

const getStatusText = (status: string, dueDate?: string) => {
  if (status === 'RETURNED') {
    return 'Returned'
  }
  
  if (status === 'APPROVED' && dueDate) {
    const today = new Date()
    const due = new Date(dueDate)
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < 0) {
      return 'Overdue'
    } else if (daysUntilDue <= 3) {
      return 'Due Soon'
    } else {
      return 'Active'
    }
  }
  
  return 'Active'
}

export default function MyBooksPage() {
  const { user, token, loading: authLoading } = useAuth()
  const [myBooks, setMyBooks] = useState<MyBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue' | 'returned'>('all')
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState<MyBook | null>(null)
  const [returningBook, setReturningBook] = useState(false)
  const [returnCondition, setReturnCondition] = useState('Good')
  const [returnNotes, setReturnNotes] = useState('')

  const fetchMyBooks = async () => {
    try {
      if (!token) {
        setError('Please log in to view your books')
        return
      }

      const response = await fetch('/api/borrow-requests?status=APPROVED,RETURNED', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error('Failed to fetch your books')
      }

      const data = await response.json()
      // Filter only approved and returned requests
      const filteredBooks = data.requests.filter((request: MyBook) => 
        request.status === 'APPROVED' || request.status === 'RETURNED'
      )
      setMyBooks(filteredBooks)
    } catch (err) {
      console.error('Error fetching my books:', err)
      setError('Failed to load your books')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) {
      return
    }
    
    if (user && token) {
      fetchMyBooks()
    } else {
      setLoading(false)
      setError('Please log in to view your books')
    }
  }, [user, token, authLoading])

  const handleReturnClick = (book: MyBook) => {
    setSelectedBook(book)
    setShowReturnModal(true)
    setReturnCondition('Good')
    setReturnNotes('')
  }

  const handleReturnBook = async () => {
    if (!selectedBook || !token) return

    setReturningBook(true)
    try {
      const response = await fetch('/api/books/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: selectedBook.id,
          condition: returnCondition,
          notes: returnNotes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to return book')
      }

      // Refresh the books list
      await fetchMyBooks()
      
      // Close modal and reset state
      setShowReturnModal(false)
      setSelectedBook(null)
      setReturnCondition('Good')
      setReturnNotes('')
      
      // Show success message
      setError('')
    } catch (err: any) {
      console.error('Error returning book:', err)
      setError(err.message || 'Failed to return book')
    } finally {
      setReturningBook(false)
    }
  }

  const getFilteredBooks = () => {
    return myBooks.filter(book => {
      if (filter === 'all') return true
      
      if (filter === 'returned') {
        return book.status === 'RETURNED'
      }
      
      if (filter === 'active') {
        return book.status === 'APPROVED'
      }
      
      if (filter === 'overdue') {
        if (book.status === 'APPROVED' && book.dueDate) {
          const today = new Date()
          const due = new Date(book.dueDate)
          return due < today
        }
        return false
      }
      
      return true
    })
  }

  const filteredBooks = getFilteredBooks()

  // Count for each filter
  const counts = {
    all: myBooks.length,
    active: myBooks.filter(b => b.status === 'APPROVED').length,
    overdue: myBooks.filter(b => {
      if (b.status === 'APPROVED' && b.dueDate) {
        const today = new Date()
        const due = new Date(b.dueDate)
        return due < today
      }
      return false
    }).length,
    returned: myBooks.filter(b => b.status === 'RETURNED').length
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your books...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">Please log in to view your books.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
          <p className="mt-2 text-gray-600">
            Books you have borrowed and their current status
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Books', count: counts.all },
                { key: 'active', label: 'Currently Borrowed', count: counts.active },
                { key: 'overdue', label: 'Overdue', count: counts.overdue },
                { key: 'returned', label: 'Returned', count: counts.returned },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Books List */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {filter !== 'all' ? filter : ''} books found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't borrowed any books yet."
                : `You don't have any ${filter} books.`
              }
            </p>
            <a
              href="/books"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Browse Books
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((myBook) => (
              <div key={myBook.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Book Image */}
                <div className="relative w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {myBook.book.image ? (
                    <img
                      src={myBook.book.image}
                      alt={myBook.book.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(myBook.status, myBook.dueDate)}`}>
                      {getStatusText(myBook.status, myBook.dueDate)}
                    </span>
                    <span className="text-xs text-gray-500">{myBook.book.category.name}</span>
                  </div>

                  {/* Book Details */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{myBook.book.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">by {myBook.book.author}</p>
                  
                  {myBook.book.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{myBook.book.description}</p>
                  )}

                  {/* Dates */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Borrowed:</span>
                      <span className="font-medium">
                        {myBook.approvedDate 
                          ? new Date(myBook.approvedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'N/A'
                        }
                      </span>
                    </div>
                    
                    {myBook.status === 'APPROVED' && myBook.dueDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Due Date:</span>
                        <span className={`font-medium ${
                          new Date(myBook.dueDate) < new Date() ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {new Date(myBook.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {myBook.status === 'RETURNED' && myBook.returnDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Returned:</span>
                        <span className="font-medium text-blue-600">
                          {new Date(myBook.returnDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Due Status for Active Books */}
                  {myBook.status === 'APPROVED' && myBook.dueDate && (
                    <div className="pt-3 border-t border-gray-100">
                      {(() => {
                        const today = new Date()
                        const due = new Date(myBook.dueDate)
                        const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                        
                        if (daysUntilDue < 0) {
                          return (
                            <div className="flex items-center text-red-600">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium">Overdue by {Math.abs(daysUntilDue)} day(s)</span>
                            </div>
                          )
                        } else if (daysUntilDue <= 3) {
                          return (
                            <div className="flex items-center text-orange-600">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium">Due in {daysUntilDue} day(s)</span>
                            </div>
                          )
                        } else {
                          return (
                            <div className="flex items-center text-green-600">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium">{daysUntilDue} day(s) remaining</span>
                            </div>
                          )
                        }
                      })()}
                    </div>
                  )}

                  {/* Return Book Button - Only show for active books */}
                  {myBook.status === 'APPROVED' && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleReturnClick(myBook)}
                        disabled={returningBook}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                                   text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 
                                   transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed 
                                   disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                      >
                        {returningBook ? 'Processing...' : 'Return Book'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Book Modal */}
      {showReturnModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Return Book</h3>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Book Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  {selectedBook.book.image ? (
                    <img
                      src={selectedBook.book.image}
                      alt={selectedBook.book.title}
                      className="w-16 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">{selectedBook.book.title}</h4>
                    <p className="text-sm text-gray-600">by {selectedBook.book.author}</p>
                    {selectedBook.dueDate && (
                      <p className="text-sm text-gray-500 mt-1">
                        Due: {new Date(selectedBook.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Book Condition */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Condition
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="Good">Good - No visible damage</option>
                  <option value="Fair">Fair - Minor wear and tear</option>
                  <option value="Damaged">Damaged - Significant damage</option>
                </select>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Any comments about the book condition or return..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none h-20"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReturnModal(false)}
                  disabled={returningBook}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturnBook}
                  disabled={returningBook}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {returningBook ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Confirm Return'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
