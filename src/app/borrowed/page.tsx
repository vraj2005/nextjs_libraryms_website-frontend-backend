"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Book {
  id: number;
  title: string;
  author: string;
  image: string;
  category: string;
  isbn: string;
  rating: number;
  status: 'Available' | 'Borrowed' | 'Reserved';
  publisher: string;
  year: number;
  description: string;
  dueDate?: string;
  borrowDate?: string;
  renewalCount?: number;
}

const availableBooks: Book[] = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    image: "/book-1.svg",
    category: "Fiction",
    isbn: "978-0525559474",
    rating: 4.5,
    status: "Available",
    publisher: "Viking",
    year: 2020,
    description: "A dazzling novel about all the choices that go into a life well lived."
  },
  {
    id: 2,
    title: "Educated",
    author: "Tara Westover",
    image: "/book-2.svg",
    category: "Non-Fiction",
    isbn: "978-0399590504",
    rating: 4.8,
    status: "Available",
    publisher: "Random House",
    year: 2018,
    description: "A memoir about a woman who, kept out of school, leaves her survivalist family."
  },
  {
    id: 3,
    title: "Clean Code",
    author: "Robert C. Martin",
    image: "/book-3.svg",
    category: "Academic",
    isbn: "978-0132350884",
    rating: 4.6,
    status: "Available",
    publisher: "Prentice Hall",
    year: 2008,
    description: "A handbook of agile software craftsmanship for professional developers."
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    image: "/book-4.svg",
    category: "History",
    isbn: "978-0062316097",
    rating: 4.7,
    status: "Available",
    publisher: "Harper",
    year: 2015,
    description: "A brief history of humankind from the Stone Age to the present."
  },
  {
    id: 5,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    image: "/book-5.svg",
    category: "Mystery",
    isbn: "978-1250301697",
    rating: 4.3,
    status: "Available",
    publisher: "Celadon Books",
    year: 2019,
    description: "A psychological thriller about a woman who refuses to speak after murdering her husband."
  },
  {
    id: 6,
    title: "Atomic Habits",
    author: "James Clear",
    image: "/book-6.svg",
    category: "Self-Help",
    isbn: "978-0735211292",
    rating: 4.9,
    status: "Available",
    publisher: "Avery",
    year: 2018,
    description: "An easy & proven way to build good habits & break bad ones."
  }
];

const currentlyBorrowedBooks: Book[] = [
  {
    id: 101,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    image: "/book-1.svg",
    category: "Academic",
    isbn: "978-0262033848",
    rating: 4.4,
    status: "Borrowed",
    publisher: "MIT Press",
    year: 2009,
    description: "A comprehensive textbook on algorithms and data structures.",
    borrowDate: "2025-07-08",
    dueDate: "2025-07-23",
    renewalCount: 0
  },
  {
    id: 102,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    image: "/book-2.svg",
    category: "Fiction",
    isbn: "978-0743273565",
    rating: 4.2,
    status: "Borrowed",
    publisher: "Scribner",
    year: 1925,
    description: "A classic American novel about the Jazz Age.",
    borrowDate: "2025-07-15",
    dueDate: "2025-08-15",
    renewalCount: 1
  },
  {
    id: 103,
    title: "Digital Marketing Strategy",
    author: "Simon Kingsnorth",
    image: "/book-3.svg",
    category: "Business",
    isbn: "978-0749484439",
    rating: 4.0,
    status: "Borrowed",
    publisher: "Kogan Page",
    year: 2019,
    description: "An implementation guide for digital marketing.",
    borrowDate: "2025-07-20",
    dueDate: "2025-07-27",
    renewalCount: 0
  }
];

export default function Borrowed() {
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>(currentlyBorrowedBooks);
  const [availableBooksState, setAvailableBooksState] = useState<Book[]>(availableBooks);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'borrowed' | 'available'>('borrowed');
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (bookId: number) => {
    const updatedFavorites = favorites.includes(bookId)
      ? favorites.filter(id => id !== bookId)
      : [...favorites, bookId];
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const handleBorrowClick = (book: Book) => {
    setSelectedBook(book);
    setShowBorrowModal(true);
    setSelectedDuration('');
  };

  const calculateDueDate = (days: number) => {
    const today = new Date();
    const dueDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return dueDate.toISOString().split('T')[0];
  };

  // Consistent date formatting to avoid hydration errors
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const calculateFine = (days: number) => {
    const finePerDay = 5; // ₹5 per day
    return days * finePerDay;
  };

  const getDurationInfo = (duration: string) => {
    switch (duration) {
      case '7':
        return { days: 7, fine: calculateFine(7), period: '7 days' };
      case '15':
        return { days: 15, fine: calculateFine(15), period: '15 days' };
      case '30':
        return { days: 30, fine: calculateFine(30), period: '1 month' };
      default:
        return { days: 0, fine: 0, period: '' };
    }
  };

  const handleConfirmBorrow = () => {
    if (selectedBook && selectedDuration) {
      const durationInfo = getDurationInfo(selectedDuration);
      const borrowedBook: Book = {
        ...selectedBook,
        status: 'Borrowed',
        borrowDate: new Date().toISOString().split('T')[0],
        dueDate: calculateDueDate(durationInfo.days),
        renewalCount: 0
      };

      setBorrowedBooks(prev => [...prev, borrowedBook]);
      setAvailableBooksState(prev => prev.filter(book => book.id !== selectedBook.id));
      setShowBorrowModal(false);
      setShowSuccessMessage(true);
      setSelectedBook(null);
      setSelectedDuration('');

      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const handleReturnBook = (bookId: number) => {
    const bookToReturn = borrowedBooks.find(book => book.id === bookId);
    if (bookToReturn) {
      const returnedBook: Book = {
        ...bookToReturn,
        status: 'Available',
        borrowDate: undefined,
        dueDate: undefined,
        renewalCount: undefined
      };

      setAvailableBooksState(prev => [...prev, returnedBook]);
      setBorrowedBooks(prev => prev.filter(book => book.id !== bookId));
    }
  };

  const handleRenewBook = (bookId: number) => {
    setBorrowedBooks(prev => prev.map(book => {
      if (book.id === bookId && book.renewalCount !== undefined && book.renewalCount < 2) {
        const currentDue = new Date(book.dueDate!);
        const newDue = new Date(currentDue.getTime() + 7 * 24 * 60 * 60 * 1000);
        return {
          ...book,
          dueDate: newDue.toISOString().split('T')[0],
          renewalCount: book.renewalCount + 1
        };
      }
      return book;
    }));
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800";
      case "Borrowed": return "bg-red-100 text-red-800";
      case "Reserved": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
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
              <pattern id="borrow-books" patternUnits="userSpaceOnUse" width="30" height="30">
                <rect width="30" height="30" fill="none"/>
                <text x="5" y="15" fontSize="12" fill="currentColor">📚</text>
                <text x="20" y="25" fontSize="8" fill="currentColor">📖</text>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#borrow-books)"/>
          </svg>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent">
              My Library
            </h1>
            <p className="text-xl md:text-2xl text-sky-100 max-w-3xl mx-auto leading-relaxed">
              Manage your borrowed books and discover new titles to borrow
            </p>
          </div>
        </div>
      </section>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-xl shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Book borrowed successfully!
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-200">
              <button
                onClick={() => setActiveTab('borrowed')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'borrowed'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50'
                }`}
              >
                My Borrowed Books ({borrowedBooks.length})
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'available'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50'
                }`}
              >
                Available to Borrow ({availableBooksState.length})
              </button>
            </div>
          </div>

          {/* Borrowed Books Section */}
          {activeTab === 'borrowed' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Currently Borrowed Books
                </h2>
                <p className="text-xl text-gray-600">
                  Keep track of your borrowed books and due dates
                </p>
              </div>

              {borrowedBooks.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                  </svg>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No Books Borrowed</h3>
                  <p className="text-gray-500 mb-6">You haven't borrowed any books yet. Browse our collection to get started!</p>
                  <button
                    onClick={() => setActiveTab('available')}
                    className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors"
                  >
                    Browse Available Books
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {borrowedBooks.map((book) => {
                    const daysUntilDue = getDaysUntilDue(book.dueDate!);
                    const overdue = isOverdue(book.dueDate!);
                    
                    return (
                      <div key={book.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-[520px] flex flex-col">
                        <div className="relative">
                          <Image
                            src={book.image}
                            alt={book.title}
                            width={300}
                            height={200}
                            className="w-full h-48 object-contain bg-gray-50"
                          />
                          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                            overdue ? 'bg-red-100 text-red-800' : 
                            daysUntilDue <= 2 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {overdue ? `Overdue by ${Math.abs(daysUntilDue)} days` : 
                             daysUntilDue === 0 ? 'Due Today' :
                             daysUntilDue === 1 ? 'Due Tomorrow' :
                             `Due in ${daysUntilDue} days`}
                          </div>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-sky-600 font-medium">{book.category}</span>
                              <div className="flex items-center text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                ))}
                                <span className="text-xs text-gray-500 ml-1">({book.rating})</span>
                              </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">by {book.author}</p>
                            
                            <div className="space-y-2 mb-4 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Borrowed:</span>
                                <span className="font-medium">{formatDate(book.borrowDate!)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Due Date:</span>
                                <span className={`font-medium ${overdue ? 'text-red-600' : daysUntilDue <= 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                                  {formatDate(book.dueDate!)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Renewals:</span>
                                <span className="font-medium">{book.renewalCount}/2</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex gap-2 mb-3">
                              <button
                                onClick={() => handleReturnBook(book.id)}
                                className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                              >
                                Return Book
                              </button>
                              <button
                                onClick={() => handleRenewBook(book.id)}
                                disabled={book.renewalCount! >= 2}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors ${
                                  book.renewalCount! >= 2
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-sky-600 text-white hover:bg-sky-700'
                                }`}
                              >
                                Renew
                              </button>
                            </div>
                            
                            {overdue && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                                <p className="text-xs text-red-800">
                                  <strong>Late Fee:</strong> ₹{Math.abs(daysUntilDue) * 5} (₹5/day)
                                </p>
                              </div>
                            )}
                            
                            <div className="flex justify-center pt-3 border-t border-gray-100">
                              <button
                                onClick={() => toggleFavorite(book.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                                  favorites.includes(book.id)
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                                }`}
                                aria-label={favorites.includes(book.id) ? "Remove from favorites" : "Add to favorites"}
                              >
                                <svg className="w-4 h-4" fill={favorites.includes(book.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="text-sm font-medium">
                                  {favorites.includes(book.id) ? "Favorited" : "Add to Favorites"}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Available Books Section */}
          {activeTab === 'available' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Available Books to Borrow
                </h2>
                <p className="text-xl text-gray-600">
                  Choose from our collection of available books
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {availableBooksState.map((book) => (
                  <div key={book.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="relative">
                      <Image
                        src={book.image}
                        alt={book.title}
                        width={300}
                        height={400}
                        className="w-full h-56 md:h-72 lg:h-80 object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(book.status)}`}>
                        {book.status}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-sky-600 mb-1 font-medium">{book.category}</p>
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm md:text-base">{book.title}</h3>
                      <p className="text-xs md:text-sm text-gray-600 mb-2">by {book.author}</p>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 md:w-4 md:h-4 ${i < Math.floor(book.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({book.rating})</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{book.description}</p>
                      <button
                        onClick={() => handleBorrowClick(book)}
                        className="w-full bg-sky-600 text-white py-2 rounded-lg font-semibold hover:bg-sky-700 transition-colors text-xs md:text-sm flex items-center justify-center gap-2 mb-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        BORROW BOOK
                      </button>
                      <div className="flex justify-center pt-2 border-t border-gray-100">
                        <button
                          onClick={() => toggleFavorite(book.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                            favorites.includes(book.id)
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                          }`}
                          aria-label={favorites.includes(book.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <svg className="w-3 h-3" fill={favorites.includes(book.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-xs font-medium">
                            {favorites.includes(book.id) ? "Favorited" : "Favorite"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Borrow Modal */}
      {showBorrowModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Borrow Book</h3>
              <p className="text-gray-600">"{selectedBook.title}" by {selectedBook.author}</p>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-gray-900">Select Borrow Duration:</h4>
              
              {[
                { value: '7', label: '7 Days', description: 'Short-term reading' },
                { value: '15', label: '15 Days', description: 'Standard period' },
                { value: '30', label: '1 Month', description: 'Extended reading' }
              ].map((option) => {
                const info = getDurationInfo(option.value);
                return (
                  <label key={option.value} className="block">
                    <input
                      type="radio"
                      name="duration"
                      value={option.value}
                      checked={selectedDuration === option.value}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedDuration === option.value
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-sky-600">Due: {calculateDueDate(info.days)}</p>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {selectedDuration && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.382 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  <div>
                    <h5 className="font-semibold text-yellow-800 mb-1">Important Notice</h5>
                    <p className="text-sm text-yellow-700">
                      If you fail to return the book by the due date, you will be charged a late fee of <strong>₹5 per day</strong>. 
                      Maximum fine for this duration: <strong>₹{getDurationInfo(selectedDuration).fine}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBorrowModal(false);
                  setSelectedBook(null);
                  setSelectedDuration('');
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBorrow}
                disabled={!selectedDuration}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
                  selectedDuration
                    ? 'bg-sky-600 text-white hover:bg-sky-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm Borrow
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
