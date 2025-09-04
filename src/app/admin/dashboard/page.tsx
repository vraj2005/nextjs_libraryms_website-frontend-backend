"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext'

interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  borrowedBooks: number;
  overdueBooks: number;
  newMembers: number;
  reservations: number;
  digitalResources: number;
  studyRooms: number;
}

interface ActivityItem {
  id: string;
  type: string;
  action: string;
  details?: string;
  member?: string;
  time: string;
  status?: string;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user || !token) return;
    if (user.role !== 'ADMIN' && user.role !== 'LIBRARIAN') {
      router.push('/');
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setStats(data.stats);
          setActivities(data.recentActivities || []);
        } else {
          console.error('Dashboard load error', data.error);
        }
      } catch (e) {
        console.error('Dashboard load failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, token, router]);

  const formatRelative = (iso: string) => {
    try {
      const date = new Date(iso);
      const diff = Date.now() - date.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch { return ''; }
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Add New Book",
      description: "Add books to library catalog",
      icon: "📚",
      link: "/admin/books?add=1",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Manage Members",
      description: "View and edit member profiles",
      icon: "👥",
      link: "/admin/members", // existing members page
      color: "from-green-500 to-green-600"
    },
    {
      title: "Issue Book",
      description: "Issue books to members",
      icon: "📖",
      link: "/admin/transactions/issue",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Generate Reports",
      description: "Library statistics and reports",
      icon: "📊",
      link: "/admin/reports",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const recentActivities = [
    { id: 1, action: "Book borrowed", details: "The Great Library by John Doe", member: "Alice Johnson", time: "2 minutes ago", type: "borrow" },
    { id: 2, action: "New member registered", details: "Robert Smith", member: "System", time: "15 minutes ago", type: "member" },
    { id: 3, action: "Book returned", details: "Digital Transformation", member: "Mike Wilson", time: "1 hour ago", type: "return" },
    { id: 4, action: "Overdue notice sent", details: "Research Methodology", member: "Sarah Davis", time: "2 hours ago", type: "overdue" },
    { id: 5, action: "Book reserved", details: "Modern Literature", member: "Tom Brown", time: "3 hours ago", type: "reserve" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Professional Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg mr-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h2>
                <p className="text-gray-600 text-lg">Welcome back! Here's what's happening in your library today.</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Time</p>
                <p className="text-lg font-semibold text-gray-800">{new Date().toLocaleTimeString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Books
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {stats.totalBooks.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  +12 this week
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Members
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                  {stats.totalMembers.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  +{stats.newMembers} today
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Borrowed Books
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  {stats.borrowedBooks.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1">
                  142 issued today
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Overdue Books
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  {stats.overdueBooks.toLocaleString()}
                </p>
                <p className="text-xs text-red-600 font-medium mt-1">
                  Needs attention
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.link}
                className={`group bg-gradient-to-br ${action.color} hover:shadow-2xl text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1 border border-white/20`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl filter drop-shadow-lg">{action.icon}</div>
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all duration-200">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-2">{action.title}</h4>
                <p className="text-sm text-white/90 leading-relaxed">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
              <div className="px-8 py-6 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Recent Activities</h3>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Live Updates
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  {activities.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-4.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No recent activity.</p>
                    </div>
                  )}
                  {activities.map(activity => {
                    const icon = activity.type === 'borrow' ? '📖' : activity.type === 'request' ? '📝' : activity.type === 'overdue' ? '⚠️' : activity.type === 'book' ? '➕' : '📌'
                    const colorConfig = activity.type === 'borrow' 
                      ? { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' }
                      : activity.type === 'request' 
                      ? { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' }
                      : activity.type === 'overdue' 
                      ? { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' }
                      : activity.type === 'book' 
                      ? { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' }
                      : { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' }
                    
                    return (
                      <div key={activity.id} className={`flex items-start space-x-4 p-4 rounded-xl border ${colorConfig.border} ${colorConfig.bg}/30 hover:${colorConfig.bg}/50 transition-all duration-200`}>
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-sm ${colorConfig.bg} ${colorConfig.text} border ${colorConfig.border}`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-gray-900">{activity.action}</p>
                          {activity.details && <p className="text-sm text-gray-600 mt-1">{activity.details}</p>}
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            {activity.member && (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium">{activity.member}</span>
                                <span className="mx-2">•</span>
                              </>
                            )}
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatRelative(activity.time)}
                          </div>
                        </div>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${colorConfig.text}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200/50">
                  <Link href="/admin/activities" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors group">
                    <span>View all activities</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Summary Cards */}
          <div className="space-y-6">
            {/* Notification Center */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-5 5-5-5h5V3h5v14z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Notification Center</h3>
              </div>
              <div className="space-y-4">
                <Link href="/admin/notifications" className="block w-full text-center bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 border border-blue-200">
                  📱 Manage Notifications
                </Link>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => window.open('/api/notifications/automated', '_blank')}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 border border-green-200"
                  >
                    📅 Due Reminders
                  </button>
                  <button 
                    onClick={() => window.open('/api/notifications/automated', '_blank')}
                    className="bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-orange-700 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 border border-orange-200"
                  >
                    ⏰ Overdue Notices
                  </button>
                </div>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Today's Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <span className="text-sm font-semibold text-gray-700">New Members</span>
                  <span className="text-lg font-bold text-blue-600">+{stats.newMembers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                  <span className="text-sm font-semibold text-gray-700">Books Issued</span>
                  <span className="text-lg font-bold text-purple-600">142</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50/50 rounded-lg border border-green-100">
                  <span className="text-sm font-semibold text-gray-700">Books Returned</span>
                  <span className="text-lg font-bold text-green-600">98</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                  <span className="text-sm font-semibold text-gray-700">Reservations</span>
                  <span className="text-lg font-bold text-amber-600">{stats.reservations}</span>
                </div>
              </div>
            </div>

            {/* Library Status */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Library Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                  <span className="text-sm font-semibold text-gray-700">Digital Resources</span>
                  <span className="text-lg font-bold text-indigo-600">{stats.digitalResources.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-cyan-50/50 rounded-lg border border-cyan-100">
                  <span className="text-sm font-semibold text-gray-700">Study Rooms</span>
                  <span className="text-lg font-bold text-cyan-600">{stats.studyRooms} total</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50/50 rounded-lg border border-green-100">
                  <span className="text-sm font-semibold text-gray-700">Available Rooms</span>
                  <span className="text-lg font-bold text-green-600">18 free</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <span className="text-sm font-semibold text-gray-700">System Status</span>
                  <span className="text-lg font-bold text-emerald-600 flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Quick Links</h3>
              </div>
              <div className="space-y-3">
                <Link href="/admin/books/search" className="block text-sm text-blue-600 hover:text-blue-800 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">🔍 Search Books</Link>
                <Link href="/admin/members/search" className="block text-sm text-blue-600 hover:text-blue-800 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">👤 Find Member</Link>
                <Link href="/admin/fines" className="block text-sm text-blue-600 hover:text-blue-800 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">💰 Manage Fines</Link>
                <Link href="/admin/backup" className="block text-sm text-blue-600 hover:text-blue-800 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">💾 System Backup</Link>
                <Link href="/admin/notifications" className="block text-sm text-blue-600 hover:text-blue-800 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">📧 Send Notifications</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
