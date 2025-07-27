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
    membershipId: string;
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Borrow Requests Management</h1>
          <p className="mt-2 text-gray-600">Review and manage book borrow requests from library members.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Requests</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Total Requests: {requests.length}
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h2>
              <p className="text-gray-600">No borrow requests match your current filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.user.name}</div>
                          <div className="text-sm text-gray-500">{request.user.email}</div>
                          <div className="text-xs text-gray-400">ID: {request.user.membershipId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.book.title}</div>
                          <div className="text-sm text-gray-500">by {request.book.author}</div>
                          <div className="text-xs text-gray-400">ISBN: {request.book.isbn}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.requestedDays} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openResponseModal(request.id, 'APPROVE')}
                              disabled={processingRequest === request.id}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {processingRequest === request.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => openResponseModal(request.id, 'REJECT')}
                              disabled={processingRequest === request.id}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            {request.responseDate && `Processed on ${new Date(request.responseDate).toLocaleDateString()}`}
                            {request.adminResponse && (
                              <div className="mt-1 text-gray-600 max-w-xs truncate" title={request.adminResponse}>
                                "{request.adminResponse}"
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
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-white border border-gray-300 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-white border border-gray-300 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {responseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {responseModal.action} Borrow Request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to {responseModal.action.toLowerCase()} this borrow request?
            </p>
            
            <div className="mb-4">
              <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                {responseModal.action === 'APPROVE' ? 'Approval Note (Optional)' : 'Rejection Reason'}
              </label>
              <textarea
                id="response"
                rows={3}
                value={responseModal.response}
                onChange={(e) => setResponseModal(prev => prev ? {...prev, response: e.target.value} : null)}
                placeholder={responseModal.action === 'APPROVE' 
                  ? 'Add any instructions or notes for the member...'
                  : 'Please provide a reason for rejection...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setResponseModal(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestAction(responseModal.requestId, responseModal.action, responseModal.response)}
                disabled={processingRequest === responseModal.requestId}
                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${
                  responseModal.action === 'APPROVE'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processingRequest === responseModal.requestId ? 'Processing...' : responseModal.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
