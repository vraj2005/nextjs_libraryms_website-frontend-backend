"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface BorrowRequest {
  id: string;
  status: string;
  requestDate: string;
  requestedDays: number;
  adminResponse?: string;
  responseDate?: string;
  user: {
    id: string;
    name: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
  };
}

export default function AdminBorrowRequestsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [responseModal, setResponseModal] = useState<{
    requestId: string;
    action: 'APPROVE' | 'REJECT';
    response: string;
  } | null>(null);

  useEffect(() => {
    if (!user || !['ADMIN', 'LIBRARIAN'].includes(user.role)) {
      router.push('/login');
      return;
    }
    fetchRequests();
  }, [user, token, selectedStatus, currentPage, router]);

  const fetchRequests = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const response = await fetch(`/api/borrow-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'APPROVE' | 'REJECT', adminResponse?: string) => {
    if (!token) return;

    try {
      setProcessingRequest(requestId);
      const response = await fetch(`/api/borrow-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          adminResponse
        })
      });

      if (response.ok) {
        // Refresh requests
        fetchRequests();
        setResponseModal(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Failed to process request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const openResponseModal = (requestId: string, action: 'APPROVE' | 'REJECT') => {
    setResponseModal({
      requestId,
      action,
      response: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || !['ADMIN', 'LIBRARIAN'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Borrow Requests
              </h1>
              <p className="text-gray-600 mt-1">Review and manage book borrow requests from library members</p>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <span className="text-gray-600">
                <span className="font-semibold text-amber-600">{requests.filter(r => r.status === 'PENDING').length}</span> Pending Review
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
              <span className="text-gray-600">
                <span className="font-semibold text-emerald-600">{requests.filter(r => r.status === 'APPROVED').length}</span> Approved Today
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-gray-600">
                <span className="font-semibold text-blue-600">{requests.length}</span> Total Requests
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Requests */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{requests.length}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Pending */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{requests.filter(r => r.status === 'PENDING').length}</p>
                <p className="text-xs text-amber-600 mt-1">Needs review</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-300 transition-all duration-300">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Approved */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Approved</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{requests.filter(r => r.status === 'APPROVED').length}</p>
                <p className="text-xs text-emerald-600 mt-1">Ready to issue</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Rejected */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-600 uppercase tracking-wider">Rejected</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{requests.filter(r => r.status === 'REJECTED').length}</p>
                <p className="text-xs text-red-600 mt-1">Declined</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Returned */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Returned</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{requests.filter(r => r.status === 'RETURNED').length}</p>
                <p className="text-xs text-blue-600 mt-1">Completed</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative">
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
                <div className="relative">
                  <select
                    id="status"
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm hover:border-gray-400 transition-colors min-w-[200px]"
                  >
                    <option value="all" className="text-gray-900 bg-white">📊 All Requests</option>
                    <option value="PENDING" className="text-gray-900 bg-white">⏳ Pending Review</option>
                    <option value="APPROVED" className="text-gray-900 bg-white">✅ Approved</option>
                    <option value="REJECTED" className="text-gray-900 bg-white">❌ Rejected</option>
                    <option value="RETURNED" className="text-gray-900 bg-white">📚 Returned</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Quick Filter Buttons */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">Quick:</span>
                <button
                  onClick={() => { setSelectedStatus('PENDING'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedStatus === 'PENDING' 
                      ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                  }`}
                >
                  Pending ({requests.filter(r => r.status === 'PENDING').length})
                </button>
                <button
                  onClick={() => { setSelectedStatus('APPROVED'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedStatus === 'APPROVED' 
                      ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  Approved ({requests.filter(r => r.status === 'APPROVED').length})
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                <span className="font-medium text-gray-900">{requests.length}</span> requests found
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={fetchRequests}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Requests</h3>
              <p className="text-gray-600">Please wait while we fetch the latest data...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No Requests Found</h2>
              <p className="text-gray-600 max-w-md mx-auto">No borrow requests match your current filter criteria. Try adjusting your filters or check back later.</p>
              <button
                onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
                className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                View All Requests
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gradient-to-r from-gray-50/80 to-blue-50/40">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Member Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Book Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Request Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-200/30">
                  {requests.map((request, index) => (
                    <tr key={request.id} className={`hover:bg-white/80 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/30' : 'bg-white/20'}`}>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                              {`${request.user.firstName?.[0] || ''}${request.user.lastName?.[0] || ''}`.toUpperCase() || 'U'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {`${request.user.firstName ?? ''} ${request.user.lastName ?? ''}`.trim() || request.user.name}
                            </div>
                            <div className="text-sm text-blue-600 font-medium">@{request.user.username || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{request.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="max-w-xs">
                          <div className="text-sm font-semibold text-gray-900 mb-1">{request.book.title}</div>
                          <div className="text-sm text-gray-600 mb-1">by {request.book.author}</div>
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            ISBN: {request.book.isbn}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900 font-medium">
                            {new Date(request.requestDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(request.requestDate).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className="text-xs text-blue-600 mt-1 font-medium">
                            Duration: 15 days
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${getStatusColor(request.status)}`}>
                          {request.status === 'PENDING' && '⏳'}
                          {request.status === 'APPROVED' && '✅'}
                          {request.status === 'REJECTED' && '❌'}
                          {request.status === 'RETURNED' && '📚'}
                          <span className="ml-1">{request.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-sm font-medium">
                        {request.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openResponseModal(request.id, 'APPROVE')}
                              disabled={processingRequest === request.id}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {processingRequest === request.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => openResponseModal(request.id, 'REJECT')}
                              disabled={processingRequest === request.id}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs space-y-1">
                            {request.responseDate && (
                              <div className="text-gray-600 font-medium">
                                Processed on {new Date(request.responseDate).toLocaleDateString()}
                              </div>
                            )}
                            {request.adminResponse && (
                              <div className="bg-gray-50 rounded-lg p-2 max-w-xs">
                                <div className="text-gray-700 text-xs font-medium mb-1">Admin Note:</div>
                                <div className="text-gray-600 text-xs" title={request.adminResponse}>
                                  {request.adminResponse.length > 50 
                                    ? `${request.adminResponse.substring(0, 50)}...` 
                                    : request.adminResponse}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-white/80 to-blue-50/20 backdrop-blur-sm px-6 py-4 border-t border-gray-200/50">
              <div className="flex items-center justify-center">
                <nav className="flex items-center space-x-1" aria-label="Pagination">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2.5 rounded-xl border border-gray-300/50 bg-white/80 text-sm font-medium text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="ml-2 hidden sm:inline">Previous</span>
                  </button>

                  {/* Page Numbers */}
                  {(() => {
                    const pages = [];
                    const showEllipsis = totalPages > 7;
                    
                    if (!showEllipsis) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Smart pagination with ellipsis
                      if (currentPage <= 4) {
                        // Show first 5 pages + ellipsis + last page
                        for (let i = 1; i <= 5; i++) pages.push(i);
                        if (totalPages > 6) pages.push('...');
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 3) {
                        // Show first page + ellipsis + last 5 pages
                        pages.push(1);
                        if (totalPages > 6) pages.push('...');
                        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                      } else {
                        // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
                        pages.push(1);
                        pages.push('...');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }

                    return pages.map((page, index) => {
                      if (page === '...') {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="relative inline-flex items-center px-4 py-2.5 border border-gray-300/50 bg-white/80 text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }

                      const pageNum = page as number;
                      const isActive = pageNum === currentPage;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2.5 border text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${
                            isActive
                              ? 'z-10 bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg transform scale-105'
                              : 'bg-white/80 border-gray-300/50 text-gray-600 hover:bg-white hover:text-gray-800 hover:border-gray-400'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    });
                  })()}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2.5 rounded-xl border border-gray-300/50 bg-white/80 text-sm font-medium text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span className="mr-2 hidden sm:inline">Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
              
              {/* Page Info */}
              <div className="flex items-center justify-center mt-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50">
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-bold text-blue-600">{currentPage}</span> of{' '}
                    <span className="font-bold text-blue-600">{totalPages}</span> pages
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {responseModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                responseModal.action === 'APPROVE' 
                  ? 'bg-gradient-to-br from-emerald-100 to-emerald-200' 
                  : 'bg-gradient-to-br from-red-100 to-red-200'
              }`}>
                {responseModal.action === 'APPROVE' ? (
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {responseModal.action === 'APPROVE' ? 'Approve Request' : 'Reject Request'}
                </h3>
                <p className="text-sm text-gray-600">
                  {responseModal.action === 'APPROVE' 
                    ? 'Grant access to this book' 
                    : 'Decline this borrow request'}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50/80 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                Are you sure you want to <span className="font-semibold">{responseModal.action.toLowerCase()}</span> this borrow request? 
                {responseModal.action === 'APPROVE' 
                  ? ' The member will be notified and can collect the book.' 
                  : ' The member will be notified of the rejection.'}
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="response" className="block text-sm font-semibold text-gray-900 mb-3">
                {responseModal.action === 'APPROVE' ? (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Approval Instructions (Optional)
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Rejection Reason *
                  </span>
                )}
              </label>
              <textarea
                id="response"
                rows={4}
                value={responseModal.response}
                onChange={(e) => setResponseModal(prev => prev ? {...prev, response: e.target.value} : null)}
                placeholder={responseModal.action === 'APPROVE' 
                  ? 'Add any special instructions for book collection, due dates, or notes for the member...'
                  : 'Please provide a clear reason for rejection to help the member understand...'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white/80 backdrop-blur-sm transition-all duration-200 resize-none"
              />
              {responseModal.action === 'REJECT' && !responseModal.response.trim() && (
                <p className="text-xs text-red-600 mt-2">A rejection reason is required</p>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setResponseModal(null)}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestAction(responseModal.requestId, responseModal.action, responseModal.response)}
                disabled={processingRequest === responseModal.requestId || (responseModal.action === 'REJECT' && !responseModal.response.trim())}
                className={`px-6 py-3 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  responseModal.action === 'APPROVE'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                }`}
              >
                {processingRequest === responseModal.requestId ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  responseModal.action === 'APPROVE' ? 'Approve Request' : 'Reject Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
