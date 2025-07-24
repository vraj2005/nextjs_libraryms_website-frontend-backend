"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Notification {
  id: number;
  type: 'due' | 'overdue' | 'reserved' | 'renewal' | 'fine' | 'general';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

const notifications: Notification[] = [
  {
    id: 1,
    type: 'overdue',
    title: 'Book Overdue',
    message: '"Introduction to Algorithms" is 3 days overdue. Please return it to avoid additional fines.',
    timestamp: '2024-07-22T10:30:00Z',
    isRead: false,
    priority: 'high'
  },
  {
    id: 2,
    type: 'due',
    title: 'Book Due Soon',
    message: '"Clean Code" is due tomorrow. You can renew it if needed.',
    timestamp: '2024-07-22T08:15:00Z',
    isRead: false,
    priority: 'medium'
  },
  {
    id: 3,
    type: 'reserved',
    title: 'Reserved Book Available',
    message: '"The Midnight Library" is now available for pickup. Reserved until July 25th.',
    timestamp: '2024-07-21T16:45:00Z',
    isRead: true,
    priority: 'medium'
  },
  {
    id: 4,
    type: 'renewal',
    title: 'Book Renewed Successfully',
    message: '"JavaScript: The Good Parts" has been renewed. New due date: August 5th.',
    timestamp: '2024-07-21T14:20:00Z',
    isRead: true,
    priority: 'low'
  },
  {
    id: 5,
    type: 'fine',
    title: 'Fine Applied',
    message: 'A fine of ₹25 has been applied to your account for late return.',
    timestamp: '2024-07-20T11:00:00Z',
    isRead: true,
    priority: 'high'
  },
  {
    id: 6,
    type: 'general',
    title: 'Library Hours Update',
    message: 'Library will be closed on July 26th for maintenance. Extended hours on July 27th.',
    timestamp: '2024-07-19T09:30:00Z',
    isRead: true,
    priority: 'low'
  }
];

export default function NotificationsPage() {
  const [notificationList, setNotificationList] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'due':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'reserved':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'renewal':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'fine':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const markAsRead = (id: number) => {
    setNotificationList(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationList(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotificationList(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notificationList.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const unreadCount = notificationList.filter(notif => !notif.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11.613 15.931l-1.175-5.334A2.966 2.966 0 0013.175 8h.65A2.966 2.966 0 0016.562 10.597l-1.175 5.334M9 3v4M15 3v4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm font-bold rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </h1>
            <Link
              href="/"
              className="text-sky-600 hover:text-sky-800 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({notificationList.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'read'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Read ({notificationList.length - unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-sky-600 hover:text-sky-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11.613 15.931l-1.175-5.334A2.966 2.966 0 0013.175 8h.65A2.966 2.966 0 0016.562 10.597l-1.175 5.334M9 3v4M15 3v4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter === 'unread' ? "You're all caught up!" : "No notifications found."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 p-6 transition-all duration-200 hover:shadow-md ${
                  !notification.isRead ? 'border-l-blue-500 bg-blue-50/30' : 'border-l-gray-300'
                } ${
                  notification.priority === 'high' ? 'border-l-red-500' :
                  notification.priority === 'medium' ? 'border-l-yellow-500' :
                  'border-l-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-sm font-semibold ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                        {notification.priority === 'high' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            High Priority
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        !notification.isRead ? 'text-gray-700' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        {filteredNotifications.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/borrowed"
                className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <span className="font-medium text-amber-800">View My Books</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-blue-800">Account Settings</span>
              </Link>
              <Link
                href="/books"
                className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="font-medium text-green-800">Browse Books</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
