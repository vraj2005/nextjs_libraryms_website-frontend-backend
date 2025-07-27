"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminReports() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    if (!adminAuth || adminAuth !== "true") {
      router.push("/admin/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Sample report data
  const reportData = {
    overview: {
      totalBooks: 15847,
      totalMembers: 5234,
      activeIssues: 3421,
      overdueBooks: 127,
      revenue: 125000,
      finesCollected: 15430
    },
    circulation: {
      issuesThisMonth: 1250,
      returnsThisMonth: 1180,
      renewalsThisMonth: 340,
      averageIssueTime: 18.5,
      popularCategories: [
        { name: "Technology", count: 320 },
        { name: "Academic", count: 285 },
        { name: "Fiction", count: 210 },
        { name: "Science", count: 195 },
        { name: "History", count: 145 }
      ]
    },
    members: {
      newMembersThisMonth: 89,
      activeMemberships: 4890,
      expiredMemberships: 344,
      suspendedMembers: 28,
      membershipTypes: [
        { type: "Standard", count: 2850 },
        { type: "Premium", count: 1540 },
        { type: "Student", count: 844 }
      ]
    },
    financial: {
      membershipRevenue: 95600,
      fineRevenue: 15430,
      otherRevenue: 13970,
      totalRevenue: 125000,
      monthlyGrowth: 12.5
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Library performance insights and statistics</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Report Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: "overview", name: "Overview", icon: "📊" },
                { id: "circulation", name: "Circulation", icon: "📚" },
                { id: "members", name: "Members", icon: "👥" },
                { id: "financial", name: "Financial", icon: "💰" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedReport(tab.id)}
                  className={`${
                    selectedReport === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Report */}
            {selectedReport === "overview" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Library Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Total Books</p>
                        <p className="text-3xl font-bold">{reportData.overview.totalBooks.toLocaleString()}</p>
                      </div>
                      <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Total Members</p>
                        <p className="text-3xl font-bold">{reportData.overview.totalMembers.toLocaleString()}</p>
                      </div>
                      <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100">Active Issues</p>
                        <p className="text-3xl font-bold">{reportData.overview.activeIssues.toLocaleString()}</p>
                      </div>
                      <svg className="w-12 h-12 text-yellow-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100">Overdue Books</p>
                        <p className="text-3xl font-bold">{reportData.overview.overdueBooks}</p>
                      </div>
                      <svg className="w-12 h-12 text-red-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Total Revenue</p>
                        <p className="text-3xl font-bold">₹{reportData.overview.revenue.toLocaleString()}</p>
                      </div>
                      <svg className="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100">Fines Collected</p>
                        <p className="text-3xl font-bold">₹{reportData.overview.finesCollected.toLocaleString()}</p>
                      </div>
                      <svg className="w-12 h-12 text-indigo-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Circulation Report */}
            {selectedReport === "circulation" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Circulation Statistics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Activity</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issues</span>
                        <span className="font-semibold text-blue-600">{reportData.circulation.issuesThisMonth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Returns</span>
                        <span className="font-semibold text-green-600">{reportData.circulation.returnsThisMonth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Renewals</span>
                        <span className="font-semibold text-yellow-600">{reportData.circulation.renewalsThisMonth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg. Issue Time</span>
                        <span className="font-semibold text-purple-600">{reportData.circulation.averageIssueTime} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Categories</h3>
                    <div className="space-y-3">
                      {reportData.circulation.popularCategories.map((category, index) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <span className="text-gray-900">{category.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(category.count / reportData.circulation.popularCategories[0].count) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 w-12 text-right">{category.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Members Report */}
            {selectedReport === "members" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Membership Analytics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Membership Status</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Memberships</span>
                        <span className="font-semibold text-green-600">{reportData.members.activeMemberships.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Expired Memberships</span>
                        <span className="font-semibold text-red-600">{reportData.members.expiredMemberships}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Suspended Members</span>
                        <span className="font-semibold text-yellow-600">{reportData.members.suspendedMembers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">New This Month</span>
                        <span className="font-semibold text-blue-600">+{reportData.members.newMembersThisMonth}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Membership Types</h3>
                    <div className="space-y-4">
                      {reportData.members.membershipTypes.map((type) => (
                        <div key={type.type} className="flex justify-between items-center">
                          <span className="text-gray-600">{type.type}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(type.count / reportData.members.membershipTypes[0].count) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-900 w-12 text-right">{type.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Report */}
            {selectedReport === "financial" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Financial Summary</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <h3 className="text-green-100 text-sm font-medium">Membership Revenue</h3>
                    <p className="text-2xl font-bold">₹{reportData.financial.membershipRevenue.toLocaleString()}</p>
                    <p className="text-green-100 text-sm mt-1">Main revenue source</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <h3 className="text-blue-100 text-sm font-medium">Fine Revenue</h3>
                    <p className="text-2xl font-bold">₹{reportData.financial.fineRevenue.toLocaleString()}</p>
                    <p className="text-blue-100 text-sm mt-1">Late return fees</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <h3 className="text-purple-100 text-sm font-medium">Other Revenue</h3>
                    <p className="text-2xl font-bold">₹{reportData.financial.otherRevenue.toLocaleString()}</p>
                    <p className="text-purple-100 text-sm mt-1">Additional services</p>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
                    <h3 className="text-indigo-100 text-sm font-medium">Total Revenue</h3>
                    <p className="text-2xl font-bold">₹{reportData.financial.totalRevenue.toLocaleString()}</p>
                    <p className="text-indigo-100 text-sm mt-1">+{reportData.financial.monthlyGrowth}% this month</p>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Membership Fees</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-500 h-3 rounded-full" 
                            style={{ width: `${(reportData.financial.membershipRevenue / reportData.financial.totalRevenue) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-20 text-right">
                          {Math.round((reportData.financial.membershipRevenue / reportData.financial.totalRevenue) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Fines</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full" 
                            style={{ width: `${(reportData.financial.fineRevenue / reportData.financial.totalRevenue) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-20 text-right">
                          {Math.round((reportData.financial.fineRevenue / reportData.financial.totalRevenue) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Other Services</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-purple-500 h-3 rounded-full" 
                            style={{ width: `${(reportData.financial.otherRevenue / reportData.financial.totalRevenue) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-20 text-right">
                          {Math.round((reportData.financial.otherRevenue / reportData.financial.totalRevenue) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
