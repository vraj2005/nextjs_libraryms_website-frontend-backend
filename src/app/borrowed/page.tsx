'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface BorrowRequest {
  id: string
  bookId: string
  userId: string
  requestDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED'
  approvedDate?: string
  dueDate?: string
  returnDate?: string
  notes?: string
  book: {
    id: string
    title: string
    author: string
    isbn: string
    category: {
      id: string
      name: string
    }
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'RETURNED':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function BorrowedPage() {
  const { user, token, loading: authLoading } = useAuth()
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED'>('all')

  const fetchBorrowRequests = async () => {
    try {
      if (!token) {
        setError('Please log in to view your borrow requests')
        return
      }

      const response = await fetch('/api/borrow-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error('Failed to fetch borrow requests')
      }

      const data = await response.json()
      setBorrowRequests(data.requests)
    } catch (err) {
      console.error('Error fetching borrow requests:', err)
      setError('Failed to load borrow requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) {
      // Wait for auth to load
      return
    }
    
    if (user && token) {
      fetchBorrowRequests()
    } else {
      setLoading(false)
      setError('Please log in to view your borrow requests')
    }
  }, [user, token, authLoading])

  const filteredRequests = borrowRequests.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your borrow requests...</p>
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
            <p className="text-gray-600">Please log in to view your borrow requests.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">My Borrow Requests</h1>
          <p className="mt-2 text-gray-600">
            Track your book borrowing requests and their status
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Requests', count: borrowRequests.length },
                { key: 'PENDING', label: 'Pending', count: borrowRequests.filter(r => r.status === 'PENDING').length },
                { key: 'APPROVED', label: 'Approved', count: borrowRequests.filter(r => r.status === 'APPROVED').length },
                { key: 'REJECTED', label: 'Rejected', count: borrowRequests.filter(r => r.status === 'REJECTED').length },
                { key: 'RETURNED', label: 'Returned', count: borrowRequests.filter(r => r.status === 'RETURNED').length },
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

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {filter !== 'all' ? filter.toLowerCase() : ''} requests found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't made any borrow requests yet."
                : `You don't have any ${filter.toLowerCase()} requests.`
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
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{request.book.title}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Book Details</label>
                            <div className="mt-1">
                              <p className="text-lg font-semibold text-gray-900">{request.book.title}</p>
                              <p className="text-gray-600">by {request.book.author}</p>
                              <p className="text-sm text-blue-600 font-medium">{request.book.category.name}</p>
                              <p className="text-sm text-gray-500">ISBN: {request.book.isbn}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Request Information</label>
                            <div className="mt-1 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Request Date:</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {new Date(request.requestDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              
                              {(request.status === 'APPROVED' || request.status === 'RETURNED') && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Approved Date:</span>
                                  <span className="text-sm font-medium text-green-700">
                                    {request.approvedDate 
                                      ? new Date(request.approvedDate).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric'
                                        })
                                      : 'Not available'
                                    }
                                  </span>
                                </div>
                              )}
                              
                              {(request.status === 'APPROVED' || request.status === 'RETURNED') && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Due Date (Return by):</span>
                                  <span className="text-sm font-medium text-orange-700">
                                    {request.dueDate 
                                      ? new Date(request.dueDate).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric'
                                        })
                                      : 'Not available'
                                    }
                                  </span>
                                </div>
                              )}
                              
                              {request.status === 'RETURNED' && request.returnDate && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Actual Return Date:</span>
                                  <span className="text-sm font-medium text-blue-700">
                                    {new Date(request.returnDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {request.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">Request Notes</label>
                          <p className="mt-1 text-sm text-gray-700">{request.notes}</p>
                        </div>
                      )}
                      
                      {/* Status Timeline */}
                      <div className="mt-6">
                        <label className="text-sm font-medium text-gray-500 mb-3 block">Request Timeline</label>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="ml-2 text-sm text-gray-600">Requested</span>
                          </div>
                          
                          {request.status !== 'PENDING' && (
                            <>
                              <div className="flex-1 h-0.5 bg-gray-300"></div>
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full ${
                                  request.status === 'APPROVED' ? 'bg-green-500' : 
                                  request.status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-300'
                                }`}></div>
                                <span className="ml-2 text-sm text-gray-600">
                                  {request.status === 'APPROVED' ? 'Approved' : 
                                   request.status === 'REJECTED' ? 'Rejected' : 'Processed'}
                                </span>
                              </div>
                            </>
                          )}
                          
                          {request.status === 'RETURNED' && (
                            <>
                              <div className="flex-1 h-0.5 bg-gray-300"></div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="ml-2 text-sm text-gray-600">Returned</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
