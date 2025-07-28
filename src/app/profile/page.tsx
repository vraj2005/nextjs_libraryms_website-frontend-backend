"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Display fields
  name: string;
  joinDate: string;
  // Additional profile fields for UI
  membershipType?: 'Basic' | 'Premium' | 'VIP';
  booksRead?: number;
  currentlyBorrowed?: number;
  totalBorrowed?: number;
  finesOwed?: number;
  favoriteGenres?: string[];
}

interface ReadingStats {
  thisMonth: number;
  thisYear: number;
  totalPages: number;
  averageRating: number;
}

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
  const { user, loading: authLoading, logout, updateUser } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'overview' | 'settings' | 'activity' | 'preferences'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Check authentication and load user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage - check both possible keys
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        
        console.log('Profile page: Checking authentication...');
        console.log('Token found:', token ? 'Yes' : 'No');
        
        if (!token) {
          console.log('No token found, redirecting to login');
          router.push('/login');
          return;
        }

        // Fetch user profile from API
        console.log('Fetching profile from API...');
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Profile API response status:', response.status);

        if (!response.ok) {
          if (response.status === 401) {
            console.log('Token invalid, logging out...');
            logout();
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        console.log('Profile data received:', data);
        
        // Transform API response to match UserProfile interface
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          name: `${data.user.firstName} ${data.user.lastName}`,
          phone: data.user.phone || '',
          address: data.user.address || '',
          role: data.user.role,
          isActive: data.user.isActive,
          joinDate: data.user.createdAt,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
          profileImage: data.user.profileImage,
          // Stats from API
          membershipType: data.user.role === 'ADMIN' ? 'VIP' : data.user.role === 'LIBRARIAN' ? 'Premium' : 'Basic',
          booksRead: data.stats.totalBorrowRequests || 0,
          currentlyBorrowed: data.recentBorrowRequests?.filter((req: any) => req.status === 'APPROVED' && !req.returnDate).length || 0,
          totalBorrowed: data.stats.totalBorrowRequests || 0,
          finesOwed: data.stats.unpaidFines || 0,
          favoriteGenres: ["Fiction", "Science", "History"] // Default for now
        };
        
        console.log('Profile state set successfully');
        setUserProfile(profile);
        setEditedProfile(profile);
        
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Only redirect to login if we're sure authentication failed
        // Otherwise, try to use fallback data
        if (!user) {
          console.log('No user context and API failed, redirecting to login');
          router.push('/login');
          return;
        }
        
        // Use fallback data if API fails but user context exists
        const fallbackProfile: UserProfile = {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phoneNumber || '',
          address: user.address || '',
          role: user.role,
          isActive: user.isActive,
          joinDate: user.createdAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profileImage: user.profileImage,
          membershipType: 'Basic',
          booksRead: 0,
          currentlyBorrowed: 0,
          totalBorrowed: 0,
          finesOwed: 0,
          favoriteGenres: ["Fiction", "Science", "History"]
        };
        
        setUserProfile(fallbackProfile);
        setEditedProfile(fallbackProfile);
      } finally {
        setLoading(false);
      }
    };

    // Only run if not in auth loading state
    if (!authLoading) {
      fetchUserProfile();
    }
  }, [authLoading, router, logout, user]);

  const validateForm = () => {
    if (!editedProfile) return false;
    
    const errors: {[key: string]: string} = {};
    
    // First Name validation
    if (!editedProfile.firstName?.trim()) {
      errors.firstName = 'First name is required';
    } else if (editedProfile.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters long';
    }
    
    // Last Name validation
    if (!editedProfile.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    } else if (editedProfile.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters long';
    }
    
    // Email validation
    if (!editedProfile.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedProfile.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone number validation
    if (!editedProfile.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      const cleanPhone = editedProfile.phone.replace(/\D/g, ''); // Remove non-digits
      if (!phoneRegex.test(cleanPhone)) {
        errors.phone = 'Phone number must be exactly 10 digits';
      }
    }
    
    // Address validation
    if (!editedProfile.address?.trim()) {
      errors.address = 'Address is required';
    } else if (editedProfile.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters long';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm() || !editedProfile || !userProfile) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // API call to update profile
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          firstName: editedProfile.firstName,
          lastName: editedProfile.lastName,
          email: editedProfile.email,
          phone: editedProfile.phone,
          address: editedProfile.address
        })
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update both userProfile and editedProfile with the new data
        const updatedProfile: UserProfile = {
          ...userProfile,
          firstName: editedProfile.firstName,
          lastName: editedProfile.lastName,
          email: editedProfile.email,
          phone: editedProfile.phone,
          address: editedProfile.address,
          name: `${editedProfile.firstName} ${editedProfile.lastName}`,
          updatedAt: new Date().toISOString()
        };
        
        setUserProfile(updatedProfile);
        setEditedProfile(updatedProfile);
        
        // Update the AuthContext so navbar reflects changes
        updateUser({
          firstName: editedProfile.firstName,
          lastName: editedProfile.lastName,
          email: editedProfile.email,
          phoneNumber: editedProfile.phone,
          address: editedProfile.address
        });
        
        setIsEditing(false);
        setShowSuccessMessage(true);
        setFormErrors({});
        
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        const error = await response.json();
        console.error('Error saving profile:', error);
        // Show error message to user
        setFormErrors({general: error.message || 'Failed to update profile'});
      }
      
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // For demo purposes, still update local state if API fails
      const updatedProfile: UserProfile = {
        ...userProfile,
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        email: editedProfile.email,
        phone: editedProfile.phone,
        address: editedProfile.address,
        name: `${editedProfile.firstName} ${editedProfile.lastName}`,
        updatedAt: new Date().toISOString()
      };
      
      setUserProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      
      // Update the AuthContext so navbar reflects changes
      updateUser({
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        email: editedProfile.email,
        phoneNumber: editedProfile.phone,
        address: editedProfile.address
      });
      
      setIsEditing(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setEditedProfile({...userProfile});
    }
    setIsEditing(false);
    setFormErrors({});
  };

  const validatePasswordForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }
    
    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordData.currentPassword && passwordData.newPassword && 
        passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (response.ok) {
        // Password changed successfully
        setShowPasswordModal(false);
        
        // Clear form data
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
        
        // Show success message and logout after a short delay
        alert('Password changed successfully! You will be redirected to login page.');
        
        // Logout user and redirect to login
        setTimeout(async () => {
          await logout();
          router.push('/login');
        }, 1000);
        
      } else {
        const error = await response.json();
        if (error.message === 'Invalid current password') {
          setPasswordErrors({currentPassword: 'Current password is incorrect'});
        } else {
          setPasswordErrors({general: error.message || 'Failed to change password'});
        }
      }
      
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordErrors({general: 'An error occurred while changing password'});
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
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
      {/* Loading State */}
      {(loading || authLoading) && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading profile...</p>
          </div>
        </div>
      )}

      {/* Profile Content - only show when not loading and userProfile exists */}
      {!loading && !authLoading && userProfile && (
        <>
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
                  <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white ${getMembershipBadgeColor(userProfile.membershipType || 'Basic')}`}>
                    {userProfile.membershipType || 'Basic'}
                  </div>
                </div>
                <div className="text-center md:text-left text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{userProfile.name}</h2>
                  <p className="text-sky-100 mb-2">Member since {formatMonthYear(userProfile.joinDate)}</p>
                  <p className="text-sky-100">{userProfile.email}</p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => {
                      setActiveSection('settings');
                      setIsEditing(true);
                    }}
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
                <div className="text-2xl md:text-3xl font-bold text-sky-600 mb-1">{userProfile.booksRead || 0}</div>
                <div className="text-gray-800 text-sm font-medium">Books Read</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-indigo-600 mb-1">{userProfile.currentlyBorrowed || 0}</div>
                <div className="text-gray-800 text-sm font-medium">Currently Borrowed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">{userProfile.totalBorrowed || 0}</div>
                <div className="text-gray-800 text-sm font-medium">Total Borrowed</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl md:text-3xl font-bold mb-1 ${(userProfile.finesOwed || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{userProfile.finesOwed || 0}
                </div>
                <div className="text-gray-800 text-sm font-medium">Fines Owed</div>
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
                        <div className="text-sm text-gray-800 font-medium">This Month</div>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 rounded-xl">
                        <div className="text-xl font-bold text-indigo-600 mb-1">{readingStats.thisYear}</div>
                        <div className="text-sm text-gray-800 font-medium">This Year</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <div className="text-xl font-bold text-purple-600 mb-1">{readingStats.totalPages.toLocaleString()}</div>
                        <div className="text-sm text-gray-800 font-medium">Pages Read</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-xl">
                        <div className="text-xl font-bold text-yellow-600 mb-1">{readingStats.averageRating}⭐</div>
                        <div className="text-sm text-gray-800 font-medium">Avg Rating</div>
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
                            <p className="text-sm text-gray-800 font-medium">{formatDate(activity.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'settings' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <span className="text-2xl">⚙️</span>
                      Account Settings
                    </h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    )}
                  </div>
                  
                  {/* Success Message */}
                  {showSuccessMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Profile updated successfully!</span>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {formErrors.general && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.124 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-sm font-medium">{formErrors.general}</span>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">First Name</label>
                        <input
                          type="text"
                          value={isEditing && editedProfile ? editedProfile.firstName : userProfile.firstName}
                          onChange={(e) => {
                            if (editedProfile) {
                              setEditedProfile({...editedProfile, firstName: e.target.value});
                              if (formErrors.firstName) {
                                setFormErrors({...formErrors, firstName: ''});
                              }
                            }
                          }}
                          disabled={!isEditing}
                          placeholder="Enter your first name"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 ${
                            formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={isEditing && editedProfile ? editedProfile.lastName : userProfile.lastName}
                          onChange={(e) => {
                            if (editedProfile) {
                              setEditedProfile({...editedProfile, lastName: e.target.value});
                              if (formErrors.lastName) {
                                setFormErrors({...formErrors, lastName: ''});
                              }
                            }
                          }}
                          disabled={!isEditing}
                          placeholder="Enter your last name"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 ${
                            formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">Username</label>
                        <input
                          type="text"
                          value={userProfile.username}
                          disabled={true}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={isEditing ? (editedProfile?.phone || '') : (userProfile.phone || '')}
                          onChange={(e) => {
                            if (editedProfile) {
                              // Only allow digits and limit to 10 characters
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setEditedProfile({...editedProfile, phone: value});
                              if (formErrors.phone) {
                                setFormErrors({...formErrors, phone: ''});
                              }
                            }
                          }}
                          disabled={!isEditing}
                          placeholder="Enter 10-digit phone number"
                          maxLength={10}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 ${
                            formErrors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                        )}
                        {isEditing && !formErrors.phone && editedProfile?.phone && (
                          <p className="mt-1 text-xs text-gray-500">
                            {editedProfile.phone.length}/10 digits
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">Email</label>
                        <input
                          type="email"
                          value={isEditing && editedProfile ? editedProfile.email : userProfile.email}
                          onChange={(e) => {
                            if (editedProfile) {
                              setEditedProfile({...editedProfile, email: e.target.value});
                              if (formErrors.email) {
                                setFormErrors({...formErrors, email: ''});
                              }
                            }
                          }}
                          disabled={!isEditing}
                          placeholder="Enter your email"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Your email address for communication</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">Address</label>
                      <textarea
                        value={isEditing && editedProfile ? (editedProfile.address || '') : (userProfile.address || '')}
                        onChange={(e) => {
                          if (editedProfile) {
                            setEditedProfile({...editedProfile, address: e.target.value});
                            if (formErrors.address) {
                              setFormErrors({...formErrors, address: ''});
                            }
                          }
                        }}
                        disabled={!isEditing}
                        rows={3}
                        placeholder="Enter your complete address"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 ${
                          formErrors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.address && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                      )}
                      {isEditing && !formErrors.address && editedProfile?.address && (
                        <p className="mt-1 text-xs text-gray-500">
                          {editedProfile.address.length} characters (minimum 10 required)
                        </p>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isSaving && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                              <p className="text-gray-800 font-medium">"{activity.book}"</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-800 font-medium">{formatDate(activity.date)}</p>
                            <p className="text-xs text-gray-600">{formatTime(activity.date)}</p>
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
                        {(userProfile.favoriteGenres || []).map((genre, index) => (
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
                          <span className="text-gray-800 font-medium">Email notifications for due dates</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-sky-600 rounded" />
                          <span className="text-gray-800 font-medium">SMS reminders</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="w-5 h-5 text-sky-600 rounded" />
                          <span className="text-gray-800 font-medium">New book recommendations</span>
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
                <div className={`p-4 rounded-xl text-white ${getMembershipBadgeColor(userProfile.membershipType || 'Basic')} mb-4`}>
                  <h5 className="font-bold text-lg">{userProfile.membershipType || 'Basic'} Member</h5>
                  <p className="text-sm opacity-90">Active since {new Date(userProfile.joinDate).getFullYear()}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-800 font-medium">Borrow up to 5 books</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-800 font-medium">30-day borrowing period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-800 font-medium">Priority reservations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-800 font-medium">Digital access included</span>
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
              <p className="text-gray-800 font-medium">Enter your current and new password</p>
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  ⚠️ After changing your password, you will be automatically logged out and redirected to the login page.
                </p>
              </div>
            </div>

            {/* General Error Message */}
            {passwordErrors.general && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
                <p className="text-sm font-medium">{passwordErrors.general}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData({...passwordData, currentPassword: e.target.value});
                    if (passwordErrors.currentPassword) {
                      setPasswordErrors({...passwordErrors, currentPassword: ''});
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 ${
                    passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter current password"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({...passwordData, newPassword: e.target.value});
                    if (passwordErrors.newPassword) {
                      setPasswordErrors({...passwordErrors, newPassword: ''});
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 ${
                    passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password (min 6 characters)"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData({...passwordData, confirmPassword: e.target.value});
                    if (passwordErrors.confirmPassword) {
                      setPasswordErrors({...passwordErrors, confirmPassword: ''});
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 ${
                    passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm new password"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePasswordModalClose}
                disabled={isChangingPassword}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-800 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="flex-1 px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isChangingPassword && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isChangingPassword ? 'Changing...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">Profile updated successfully!</span>
        </div>
      )}
      </>
      )}

    </main>
  );
}
