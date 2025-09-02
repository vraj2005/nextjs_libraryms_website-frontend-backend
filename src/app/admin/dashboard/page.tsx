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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome back! Here's what's happening in your library today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBooks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Borrowed Books</p>
                <p className="text-2xl font-bold text-gray-900">{stats.borrowedBooks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue Books</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdueBooks.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.link}
                className={`bg-gradient-to-r ${action.color} hover:shadow-lg text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105`}
              >
                <div className="text-3xl mb-2">{action.icon}</div>
                <h4 className="text-lg font-semibold mb-1">{action.title}</h4>
                <p className="text-sm text-white/80">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {activities.length === 0 && (
                    <p className="text-sm text-gray-500">No recent activity.</p>
                  )}
                  {activities.map(activity => {
                    const icon = activity.type === 'borrow' ? '📖' : activity.type === 'request' ? '📝' : activity.type === 'overdue' ? '⚠️' : activity.type === 'book' ? '➕' : '📌'
                    const color = activity.type === 'borrow' ? 'bg-blue-100 text-blue-600' : activity.type === 'request' ? 'bg-purple-100 text-purple-600' : activity.type === 'overdue' ? 'bg-red-100 text-red-600' : activity.type === 'book' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs ${color}`}>{icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          {activity.details && <p className="text-sm text-gray-500">{activity.details}</p>}
                          <p className="text-xs text-gray-400 mt-1">
                            {activity.member && <>by {activity.member} • </>}
                            {formatRelative(activity.time)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6">
                  <Link href="/admin/activities" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View all activities →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📨 Notification Center</h3>
              <div className="space-y-3">
                <Link href="/admin/notifications" className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Manage Automated Notifications
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => window.open('/api/notifications/automated', '_blank')}
                    className="bg-green-50 hover:bg-green-100 text-green-700 py-2 px-3 rounded text-xs font-medium transition-colors"
                  >
                    📅 Due Reminders
                  </button>
                  <button 
                    onClick={() => window.open('/api/notifications/automated', '_blank')}
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 py-2 px-3 rounded text-xs font-medium transition-colors"
                  >
                    ⏰ Overdue Notices
                  </button>
                </div>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">New Members</span>
                  <span className="text-sm font-medium text-gray-900">+{stats.newMembers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Books Issued</span>
                  <span className="text-sm font-medium text-gray-900">142</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Books Returned</span>
                  <span className="text-sm font-medium text-gray-900">98</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Reservations</span>
                  <span className="text-sm font-medium text-gray-900">{stats.reservations}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Library Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Digital Resources</span>
                  <span className="text-sm font-medium text-gray-900">{stats.digitalResources.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Study Rooms</span>
                  <span className="text-sm font-medium text-gray-900">{stats.studyRooms} total</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Available Rooms</span>
                  <span className="text-sm font-medium text-green-600">18 free</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">System Status</span>
                  <span className="text-sm font-medium text-green-600">● Online</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/admin/books/search" className="block text-sm text-blue-600 hover:text-blue-800">Search Books</Link>
                <Link href="/admin/members/search" className="block text-sm text-blue-600 hover:text-blue-800">Find Member</Link>
                <Link href="/admin/fines" className="block text-sm text-blue-600 hover:text-blue-800">Manage Fines</Link>
                <Link href="/admin/backup" className="block text-sm text-blue-600 hover:text-blue-800">System Backup</Link>
                <Link href="/admin/notifications" className="block text-sm text-blue-600 hover:text-blue-800">Send Notifications</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
