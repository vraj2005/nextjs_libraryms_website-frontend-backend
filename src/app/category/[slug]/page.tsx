"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Mock data for books by category
const booksByCategory = {
  fiction: [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0-7432-7356-5",
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop&crop=center",
      description: "A classic American novel about the Jazz Age and the American Dream.",
      year: 1925,
      pages: 180,
      rating: 4.2,
      available: true,
      genre: "Classic Literature"
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0-06-112008-4",
      cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center",
      description: "A gripping tale of racial injustice and childhood innocence.",
      year: 1960,
      pages: 324,
      rating: 4.5,
      available: true,
      genre: "Classic Literature"
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      isbn: "978-0-452-28423-4",
      cover: "https://images.unsplash.com/photo-1535905557558-afc4877cdf3f?w=400&h=600&fit=crop&crop=center",
      description: "A dystopian social science fiction novel about totalitarianism.",
      year: 1949,
      pages: 328,
      rating: 4.4,
      available: false,
      genre: "Dystopian Fiction"
    },
    {
      id: 4,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "978-0-14-143951-8",
      cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop&crop=center",
      description: "A romantic novel about manners, upbringing, and marriage.",
      year: 1813,
      pages: 432,
      rating: 4.3,
      available: true,
      genre: "Romance"
    }
  ],
  "non-fiction": [
    {
      id: 5,
      title: "Sapiens",
      author: "Yuval Noah Harari",
      isbn: "978-0-06-231609-7",
      cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop&crop=center",
      description: "A brief history of humankind and how we became the dominant species.",
      year: 2011,
      pages: 443,
      rating: 4.6,
      available: true,
      genre: "History"
    },
    {
      id: 6,
      title: "Educated",
      author: "Tara Westover",
      isbn: "978-0-399-59050-4",
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center",
      description: "A powerful memoir about education, family, and the struggle for self-invention.",
      year: 2018,
      pages: 334,
      rating: 4.7,
      available: true,
      genre: "Memoir"
    },
    {
      id: 7,
      title: "The Immortal Life of Henrietta Lacks",
      author: "Rebecca Skloot",
      isbn: "978-1-4000-5217-2",
      cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop&crop=center",
      description: "The story of how one woman's cells revolutionized medical science.",
      year: 2010,
      pages: 381,
      rating: 4.5,
      available: true,
      genre: "Science"
    }
  ],
  academic: [
    {
      id: 8,
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      isbn: "978-0-262-03384-8",
      cover: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop&crop=center",
      description: "Comprehensive introduction to the modern study of computer algorithms.",
      year: 2009,
      pages: 1292,
      rating: 4.4,
      available: true,
      genre: "Computer Science"
    },
    {
      id: 9,
      title: "Calculus: Early Transcendentals",
      author: "James Stewart",
      isbn: "978-1-285-74155-0",
      cover: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop&crop=center",
      description: "Comprehensive calculus textbook for students and professionals.",
      year: 2015,
      pages: 1368,
      rating: 4.2,
      available: false,
      genre: "Mathematics"
    },
    {
      id: 10,
      title: "Organic Chemistry",
      author: "Paula Yurkanis Bruice",
      isbn: "978-0-321-80322-1",
      cover: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=600&fit=crop&crop=center",
      description: "Essential principles and mechanisms of organic chemistry.",
      year: 2016,
      pages: 1216,
      rating: 4.1,
      available: true,
      genre: "Chemistry"
    }
  ],
  journals: [
    {
      id: 11,
      title: "Nature",
      author: "Nature Publishing Group",
      isbn: "ISSN 0028-0836",
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center",
      description: "International weekly journal of science publishing research.",
      year: 2024,
      pages: 120,
      rating: 4.8,
      available: true,
      genre: "Scientific Journal"
    },
    {
      id: 12,
      title: "Harvard Business Review",
      author: "Harvard Business Publishing",
      isbn: "ISSN 0017-8012",
      cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop&crop=center",
      description: "Management magazine focusing on business strategy and leadership.",
      year: 2024,
      pages: 98,
      rating: 4.6,
      available: true,
      genre: "Business Journal"
    }
  ],
  reference: [
    {
      id: 13,
      title: "Oxford English Dictionary",
      author: "Oxford University Press",
      isbn: "978-0-19-861186-8",
      cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center",
      description: "Comprehensive dictionary of the English language.",
      year: 2023,
      pages: 2400,
      rating: 4.9,
      available: true,
      genre: "Dictionary"
    },
    {
      id: 14,
      title: "Encyclopedia Britannica",
      author: "Britannica Inc.",
      isbn: "978-1-59339-292-5",
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop&crop=center",
      description: "General knowledge encyclopedia covering all fields of knowledge.",
      year: 2023,
      pages: 3200,
      rating: 4.7,
      available: true,
      genre: "Encyclopedia"
    }
  ],
  digital: [
    {
      id: 15,
      title: "Digital Minimalism",
      author: "Cal Newport",
      isbn: "978-0-525-53651-8",
      cover: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop&crop=center",
      description: "A philosophy for technology use that maximizes well-being.",
      year: 2019,
      pages: 304,
      rating: 4.3,
      available: true,
      genre: "Technology"
    },
    {
      id: 16,
      title: "The Code Book",
      author: "Simon Singh",
      isbn: "978-0-385-49532-5",
      cover: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop&crop=center",
      description: "The science of secrecy from ancient Egypt to quantum cryptography.",
      year: 2000,
      pages: 432,
      rating: 4.5,
      available: true,
      genre: "Cryptography"
    }
  ]
};

const categoryInfo = {
  fiction: {
    title: "Fiction",
    description: "Explore imaginative stories, novels, and literary works that transport you to different worlds and perspectives.",
    icon: "📚",
    color: "purple"
  },
  "non-fiction": {
    title: "Non-Fiction",
    description: "Discover factual books, memoirs, biographies, and educational content based on real events and experiences.",
    icon: "📖",
    color: "green"
  },
  academic: {
    title: "Academic Resources",
    description: "Access textbooks, research materials, and scholarly publications for academic study and professional development.",
    icon: "🎓",
    color: "blue"
  },
  journals: {
    title: "Journals",
    description: "Stay updated with the latest research, industry insights, and professional publications across various fields.",
    icon: "📊",
    color: "orange"
  },
  reference: {
    title: "Reference",
    description: "Find dictionaries, encyclopedias, and reference materials for quick information lookup and research.",
    icon: "❓",
    color: "red"
  },
  digital: {
    title: "Digital Books",
    description: "Access our collection of e-books, digital publications, and technology-focused literature.",
    icon: "💻",
    color: "pink"
  }
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('title');
  const [filterBy, setFilterBy] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showBookDetails, setShowBookDetails] = useState(false);

  const category = categoryInfo[slug as keyof typeof categoryInfo];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const categoryBooks = booksByCategory[slug as keyof typeof booksByCategory] || [];
      setBooks(categoryBooks);
      setLoading(false);
    }, 500);
  }, [slug]);

  const toggleFavorite = (bookId: number) => {
    setFavorites(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const openBookDetails = (book: any) => {
    setSelectedBook(book);
    setShowBookDetails(true);
  };

  const closeBookDetails = () => {
    setShowBookDetails(false);
    setSelectedBook(null);
  };

  const filteredAndSortedBooks = books
    .filter(book => {
      if (filterBy === 'all') return true;
      if (filterBy === 'available') return book.available;
      if (filterBy === 'unavailable') return !book.available;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'year':
          return b.year - a.year;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white py-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <img 
            src={slug === 'fiction' ? 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=600&fit=crop&crop=center' :
                 slug === 'non-fiction' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop&crop=center' :
                 slug === 'academic' ? 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=600&fit=crop&crop=center' :
                 slug === 'journals' ? 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop&crop=center' :
                 slug === 'reference' ? 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&h=600&fit=crop&crop=center' :
                 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=600&fit=crop&crop=center'}
            alt={`${category.title} background`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sky-600/70 via-blue-600/70 to-indigo-600/70"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="text-6xl mb-4 drop-shadow-lg">{category.icon}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">{category.title}</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 drop-shadow">
              {category.description}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                {books.length} {books.length === 1 ? 'Book' : 'Books'} Available
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                {books.filter(book => book.available).length} Currently Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="year">Publication Year</option>
                <option value="rating">Rating</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by:</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Books</option>
                <option value="available">Available</option>
                <option value="unavailable">Checked Out</option>
              </select>
            </div>
          </div>
          </div>

        {/* Books Grid */}
        {filteredAndSortedBooks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Books Found</h3>
            <p className="text-gray-600 mb-8">No books match your current filter criteria.</p>
            <button
              onClick={() => setFilterBy('all')}
              className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors"
            >
              Show All Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedBooks.map((book) => (
              <div
                key={book.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 ${
                  book.available 
                    ? category.color === 'purple' ? 'border-purple-500' :
                      category.color === 'green' ? 'border-green-500' :
                      category.color === 'blue' ? 'border-blue-500' :
                      category.color === 'orange' ? 'border-orange-500' :
                      category.color === 'red' ? 'border-red-500' :
                      category.color === 'pink' ? 'border-pink-500' : 'border-sky-500'
                    : 'border-gray-400'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden shadow-md">
                      <img 
                        src={book.cover} 
                        alt={`${book.title} cover`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">📖</div>';
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.available ? 'Available' : 'Checked Out'}
                      </div>
                      <button
                        onClick={() => toggleFavorite(book.id)}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors group"
                        title={favorites.includes(book.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <svg 
                          className={`w-5 h-5 transition-all duration-200 ${
                            favorites.includes(book.id) 
                              ? 'text-red-500 fill-red-500 scale-110' 
                              : 'text-gray-400 hover:text-red-400 group-hover:scale-110'
                          }`} 
                          fill={favorites.includes(book.id) ? 'currentColor' : 'none'} 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                    {book.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{book.year}</span>
                    <span>{book.pages} pages</span>
                    <span className="flex items-center gap-1">
                      ⭐ {book.rating}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        book.available
                          ? category.color === 'purple' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                            category.color === 'green' ? 'bg-green-600 text-white hover:bg-green-700' :
                            category.color === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                            category.color === 'orange' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                            category.color === 'red' ? 'bg-red-600 text-white hover:bg-red-700' :
                            category.color === 'pink' ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-sky-600 text-white hover:bg-sky-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!book.available}
                    >
                      {book.available ? 'Borrow Book' : 'Currently Unavailable'}
                    </button>
                    <button 
                      onClick={() => openBookDetails(book)}
                      className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Details Modal */}
      {showBookDetails && selectedBook && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeBookDetails}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">Book Details</h2>
              <button
                onClick={closeBookDetails}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Book Cover */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-40 md:w-40 md:h-52 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden shadow-lg mx-auto">
                    <img 
                      src={selectedBook.cover} 
                      alt={`${selectedBook.title} cover`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl md:text-5xl">📖</div>';
                        }
                      }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-center">
                    <button
                      onClick={() => toggleFavorite(selectedBook.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <svg 
                        className={`w-5 h-5 ${
                          favorites.includes(selectedBook.id) 
                            ? 'text-red-500 fill-red-500' 
                            : 'text-gray-400'
                        }`} 
                        fill={favorites.includes(selectedBook.id) ? 'currentColor' : 'none'} 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {favorites.includes(selectedBook.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                  </div>
                </div>

                {/* Book Information */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-800 leading-tight">{selectedBook.title}</h1>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedBook.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedBook.available ? 'Available' : 'Checked Out'}
                    </div>
                  </div>

                  <p className="text-xl text-gray-600 mb-4">by {selectedBook.author}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="text-sm font-medium text-gray-500">ISBN</span>
                      <p className="text-gray-800">{selectedBook.isbn}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Genre</span>
                      <p className="text-gray-800">{selectedBook.genre}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Publication Year</span>
                      <p className="text-gray-800">{selectedBook.year}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Pages</span>
                      <p className="text-gray-800">{selectedBook.pages}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">Rating</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.floor(selectedBook.rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-gray-600">({selectedBook.rating}/5)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-sm font-medium text-gray-500 block mb-2">Description</span>
                    <p className="text-gray-700 leading-relaxed">{selectedBook.description}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                        selectedBook.available
                          ? category.color === 'purple' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                            category.color === 'green' ? 'bg-green-600 text-white hover:bg-green-700' :
                            category.color === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                            category.color === 'orange' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                            category.color === 'red' ? 'bg-red-600 text-white hover:bg-red-700' :
                            category.color === 'pink' ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-sky-600 text-white hover:bg-sky-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedBook.available}
                    >
                      {selectedBook.available ? 'Borrow This Book' : 'Currently Unavailable'}
                    </button>
                    <button
                      onClick={closeBookDetails}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}