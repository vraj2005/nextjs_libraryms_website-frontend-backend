"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipType: 'Basic' | 'Premium' | 'VIP';
  membershipDate: string;
  profileImage: string;
  booksRead: number;
  currentlyBorrowed: number;
  totalBorrowed: number;
  finesOwed: number;
  favoriteGenres: string[];
}

interface ReadingStats {
  thisMonth: number;
  thisYear: number;
  totalPages: number;
  averageRating: number;
}

const userProfile: UserProfile = {
  id: "USR001",
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "+1 (555) 123-4567",
  address: "123 Library Street, Reading City, RC 12345",
  membershipType: "Premium",
  membershipDate: "2023-01-15",
  profileImage: "/book-1.svg", // Using book SVG as placeholder for profile
  booksRead: 47,
  currentlyBorrowed: 3,
  totalBorrowed: 152,
  finesOwed: 0,
  favoriteGenres: ["Fiction", "History", "Science", "Biography"]
};

const readingStats: ReadingStats = {
  thisMonth: 4,
  thisYear: 47,
  totalPages: 12450,
  averageRating: 4.2
};

const recentActivity = [
  { date: "2025-07-22", action: "Borrowed", book: "Digital Marketing Strategy", status: "success" },
  { date: "2025-07-20", action: "Returned", book: "Clean Code", status: "success" },
  { date: "2025-07-18", action: "Renewed", book: "The Great Gatsby", status: "info" },
  { date: "2025-07-15", action: "Borrowed", book: "The Great Gatsby", status: "success" },
  { date: "2025-07-10", action: "Returned", book: "Sapiens", status: "success" },
];

export default function Profile() {
  const [activeSection, setActiveSection] = useState<'overview' | 'settings' | 'activity' | 'preferences'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(userProfile);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleSaveProfile = () => {
    // Here you would typically save to a backend
    setIsEditing(false);
    // Show success message
  };

  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  const getMembershipBadgeColor = (type: string) => {
    switch (type) {
      case 'VIP': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'Premium': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'Basic': return 'bg-gradient-to-r from-green-500 to-teal-500';
      default: return 'bg-gray-500';
    }
  };

  // Consistent date formatting to avoid hydration errors
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'Borrowed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        );
      case 'Returned':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Renewed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-indigo-600 to-sky-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="profile-pattern" patternUnits="userSpaceOnUse" width="30" height="30">
                <rect width="30" height="30" fill="none"/>
                <text x="5" y="15" fontSize="12" fill="currentColor">👤</text>
                <text x="20" y="25" fontSize="8" fill="currentColor">📚</text>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#profile-pattern)"/>
          </svg>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-xl md:text-2xl text-sky-100 max-w-3xl mx-auto leading-relaxed">
              Manage your account and track your reading journey
            </p>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-8 py-12">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-6xl">
                    👤
                  </div>
                  <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white ${getMembershipBadgeColor(userProfile.membershipType)}`}>
                    {userProfile.membershipType}
                  </div>
                </div>
                <div className="text-center md:text-left text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{userProfile.name}</h2>
                  <p className="text-sky-100 mb-2">Member since {formatMonthYear(userProfile.membershipDate)}</p>
                  <p className="text-sky-100">Member ID: {userProfile.id}</p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-sky-600 mb-1">{userProfile.booksRead}</div>
                <div className="text-gray-600 text-sm">Books Read</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-indigo-600 mb-1">{userProfile.currentlyBorrowed}</div>
                <div className="text-gray-600 text-sm">Currently Borrowed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">{userProfile.totalBorrowed}</div>
                <div className="text-gray-600 text-sm">Total Borrowed</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl md:text-3xl font-bold mb-1 ${userProfile.finesOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{userProfile.finesOwed}
                </div>
                <div className="text-gray-600 text-sm">Fines Owed</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-200 flex flex-wrap gap-1">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'settings', label: 'Settings', icon: '⚙️' },
                { id: 'activity', label: 'Activity', icon: '📋' },
                { id: 'preferences', label: 'Preferences', icon: '❤️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeSection === tab.id
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeSection === 'overview' && (
                <div className="space-y-8">
                  {/* Reading Statistics */}
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <span className="text-2xl">📈</span>
                      Reading Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-sky-50 rounded-xl">
                        <div className="text-xl font-bold text-sky-600 mb-1">{readingStats.thisMonth}</div>
                        <div className="text-sm text-gray-600">This Month</div>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 rounded-xl">
                        <div className="text-xl font-bold text-indigo-600 mb-1">{readingStats.thisYear}</div>
                        <div className="text-sm text-gray-600">This Year</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <div className="text-xl font-bold text-purple-600 mb-1">{readingStats.totalPages.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Pages Read</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-xl">
                        <div className="text-xl font-bold text-yellow-600 mb-1">{readingStats.averageRating}⭐</div>
                        <div className="text-sm text-gray-600">Avg Rating</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <span className="text-2xl">🕐</span>
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.status === 'success' ? 'bg-green-100 text-green-600' :
                            activity.status === 'info' ? 'bg-blue-100 text-blue-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {getActivityIcon(activity.action)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {activity.action} "{activity.book}"
                            </p>
                            <p className="text-sm text-gray-600">{formatDate(activity.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'settings' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-2xl">⚙️</span>
                    Account Settings
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={isEditing ? editedProfile.name : userProfile.name}
                          onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={isEditing ? editedProfile.email : userProfile.email}
                          onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={isEditing ? editedProfile.phone : userProfile.phone}
                          onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Membership Type</label>
                        <input
                          type="text"
                          value={userProfile.membershipType}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        value={isEditing ? editedProfile.address : userProfile.address}
                        onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveProfile}
                          className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Security</h4>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'activity' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    Activity History
                  </h3>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              activity.status === 'success' ? 'bg-green-100 text-green-600' :
                              activity.status === 'info' ? 'bg-blue-100 text-blue-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {getActivityIcon(activity.action)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{activity.action} Book</h4>
                              <p className="text-gray-600">"{activity.book}"</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                            <p className="text-xs text-gray-400">{formatTime(activity.date)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-2xl">❤️</span>
                    Reading Preferences
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Favorite Genres</h4>
                      <div className="flex flex-wrap gap-3">
                        {userProfile.favoriteGenres.map((genre, index) => (
                          <span key={index} className="px-4 py-2 bg-sky-100 text-sky-800 rounded-full font-medium">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h4>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-sky-600 rounded" />
                          <span>Email notifications for due dates</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-sky-600 rounded" />
                          <span>SMS reminders</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="w-5 h-5 text-sky-600 rounded" />
                          <span>New book recommendations</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Browse Books
                  </button>
                  <button className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    My Books
                  </button>
                  <button className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Reading List
                  </button>
                </div>
              </div>

              {/* Membership Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Membership Benefits</h4>
                <div className={`p-4 rounded-xl text-white ${getMembershipBadgeColor(userProfile.membershipType)} mb-4`}>
                  <h5 className="font-bold text-lg">{userProfile.membershipType} Member</h5>
                  <p className="text-sm opacity-90">Active since {new Date(userProfile.membershipDate).getFullYear()}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Borrow up to 5 books</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>30-day borrowing period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Priority reservations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Digital access included</span>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 border border-sky-600 text-sky-600 rounded-xl font-semibold hover:bg-sky-50 transition-colors">
                  Upgrade Membership
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h3>
              <p className="text-gray-600">Enter your current and new password</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
