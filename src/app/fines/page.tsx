"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Fine {
  id: string;
  amount: number;
  daysOverdue: number;
  isPaid: boolean;
  paidDate: string | null;
  createdAt: string;
  borrowRequest: {
    id: string;
    book: {
      title: string;
      author: string;
      image: string | null;
    };
    dueDate: string;
    returnDate: string | null;
  };
}

export default function FinesPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingFine, setPayingFine] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !token) {
      router.push('/login');
      return;
    }

    fetchFines();
  }, [user, token, authLoading, router]);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fines', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fines');
      }

      const data = await response.json();
      setFines(data.fines || []);
    } catch (err) {
      console.error('Error fetching fines:', err);
      setError('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  const payFine = async (fineId: string) => {
    try {
      setPayingFine(fineId);
      const response = await fetch(`/api/fines/${fineId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to pay fine');
      }

      // Refresh fines list
      await fetchFines();
    } catch (err) {
      console.error('Error paying fine:', err);
      setError('Failed to pay fine');
    } finally {
      setPayingFine(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-sky-700 font-medium">Loading your fines...</p>
        </div>
      </div>
    );
  }

  const totalUnpaidFines = fines.filter(fine => !fine.isPaid).reduce((total, fine) => total + fine.amount, 0);
  const totalPaidFines = fines.filter(fine => fine.isPaid).reduce((total, fine) => total + fine.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Library Fines
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your library fines and payment history
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Link
                href="/my-books"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg text-center"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                </svg>
                My Books
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-red-100 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-red-600">₹{totalUnpaidFines}</p>
                <p className="text-gray-600 font-medium">Unpaid Fines</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">₹{totalPaidFines}</p>
                <p className="text-gray-600 font-medium">Paid Fines</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0.621 0 1.125-.504 1.125-1.125V9.375c0-.621.504-1.125 1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">{fines.length}</p>
                <p className="text-gray-600 font-medium">Total Fines</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Fines List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Fine History</h2>
            <p className="text-gray-600 mt-1">All your library fines and payment records</p>
          </div>

          {fines.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Fines Found</h3>
              <p className="text-gray-600">You have no library fines. Keep up the good work!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Book</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Days Overdue</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fine Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fines.map((fine) => (
                    <tr key={fine.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {fine.borrowRequest.book.image ? (
                            <img
                              src={fine.borrowRequest.book.image}
                              alt={fine.borrowRequest.book.title}
                              className="w-12 h-16 object-cover rounded-lg mr-4 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mr-4 flex items-center justify-center shadow-sm">
                              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">{fine.borrowRequest.book.title}</p>
                            <p className="text-sm text-gray-600">{fine.borrowRequest.book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(fine.borrowRequest.dueDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          {fine.daysOverdue} days
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-bold text-red-600">₹{fine.amount}</p>
                      </td>
                      <td className="px-6 py-4">
                        {fine.isPaid ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!fine.isPaid ? (
                          <button
                            onClick={() => payFine(fine.id)}
                            disabled={payingFine === fine.id}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {payingFine === fine.id ? (
                              <div className="flex items-center">
                                <svg className="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Paying...
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                </svg>
                                Pay Fine
                              </div>
                            )}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Paid on {fine.paidDate ? new Date(fine.paidDate).toLocaleDateString() : 'N/A'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Library Fine Policy</h3>
              <div className="text-blue-700 space-y-2">
                <p>• <strong>Fine Rate:</strong> ₹100 per day for overdue books</p>
                <p>• <strong>Grace Period:</strong> No grace period - fines start from day 1 of overdue</p>
                <p>• <strong>Payment:</strong> Fines must be paid before borrowing new books</p>
                <p>• <strong>Renewal:</strong> Books can be renewed once if not reserved by others</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
