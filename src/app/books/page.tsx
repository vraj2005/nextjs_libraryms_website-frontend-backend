"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Extended books database with full details
const allBooks = [
  {
    id: 1,
    title: "The Great Library",
    author: "Dr. Elena Richardson",
    category: "Academic",
    image: "/book-1.svg",
    rating: 4.8,
    status: "Available",
    description: "A comprehensive guide to modern library science and information management systems. This book explores the evolution of libraries from traditional repositories to digital hubs of knowledge, covering everything from cataloging systems to user experience design.",
    publishYear: 2023,
    isbn: "978-0-123456-78-9",
    pages: 320,
    language: "English",
    publisher: "Academic Press",
    edition: "3rd Edition",
    subjects: ["Library Science", "Information Management", "Digital Libraries"],
    availability: {
      total: 5,
      available: 3,
      borrowed: 2
    },
    location: "Section A - Floor 2",
    callNumber: "020.1 RIC",
    format: "Hardcover",
    price: "₹2,850"
  },
  {
    id: 2,
    title: "Digital Transformation",
    author: "Prof. Michael Chen",
    category: "Technology",
    image: "/book-2.svg",
    rating: 4.9,
    status: "Available",
    description: "Understanding the impact of digital technology on modern society, business, and personal life. This comprehensive text examines how digital transformation is reshaping industries, creating new opportunities, and challenging traditional business models.",
    publishYear: 2024,
    isbn: "978-0-987654-32-1",
    pages: 256,
    language: "English",
    publisher: "Tech Publications",
    edition: "2nd Edition",
    subjects: ["Digital Technology", "Business Transformation", "Innovation"],
    availability: {
      total: 8,
      available: 6,
      borrowed: 2
    },
    location: "Section C - Floor 1",
    callNumber: "004.6 CHE",
    format: "Paperback",
    price: "₹1,950"
  },
  {
    id: 3,
    title: "Research Methodology",
    author: "Dr. Sarah Williams",
    category: "Academic",
    image: "/book-3.svg",
    rating: 4.7,
    status: "Reserved",
    description: "Essential guide for academic research and scholarly writing. This book provides a comprehensive overview of research methods, from qualitative and quantitative approaches to data analysis and presentation techniques.",
    publishYear: 2023,
    isbn: "978-0-456789-12-3",
    pages: 384,
    language: "English",
    publisher: "Research Press",
    edition: "5th Edition",
    subjects: ["Research Methods", "Academic Writing", "Data Analysis"],
    availability: {
      total: 4,
      available: 0,
      borrowed: 3,
      reserved: 1
    },
    location: "Section A - Floor 3",
    callNumber: "001.42 WIL",
    format: "Hardcover",
    price: "₹3,200"
  },
  {
    id: 4,
    title: "Modern Literature",
    author: "James Patterson",
    category: "Fiction",
    image: "/book-4.svg",
    rating: 4.6,
    status: "Available",
    description: "A collection of contemporary literary works and analysis. This anthology brings together the most influential pieces of modern literature, accompanied by critical analysis and historical context.",
    publishYear: 2024,
    isbn: "978-0-234567-89-1",
    pages: 292,
    language: "English",
    publisher: "Literary House",
    edition: "1st Edition",
    subjects: ["Modern Literature", "Literary Analysis", "Contemporary Fiction"],
    availability: {
      total: 6,
      available: 4,
      borrowed: 2
    },
    location: "Section B - Floor 2",
    callNumber: "813.54 PAT",
    format: "Paperback",
    price: "₹1,450"
  },
  {
    id: 5,
    title: "Data Science Fundamentals",
    author: "Dr. Lisa Zhang",
    category: "Technology",
    image: "/book-5.svg",
    rating: 4.9,
    status: "Available",
    description: "Complete guide to data science, analytics, and machine learning. From basic statistical concepts to advanced machine learning algorithms, this book provides hands-on examples and practical applications in real-world scenarios.",
    publishYear: 2024,
    isbn: "978-0-345678-91-2",
    pages: 448,
    language: "English",
    publisher: "Data Science Press",
    edition: "4th Edition",
    subjects: ["Data Science", "Machine Learning", "Statistics", "Analytics"],
    availability: {
      total: 10,
      available: 7,
      borrowed: 3
    },
    location: "Section C - Floor 2",
    callNumber: "006.31 ZHA",
    format: "Hardcover",
    price: "₹3,750"
  },
  {
    id: 6,
    title: "Environmental Studies",
    author: "Prof. David Green",
    category: "Science",
    image: "/book-6.svg",
    rating: 4.5,
    status: "Checked Out",
    description: "Comprehensive study of environmental science and sustainability. This textbook covers climate change, biodiversity, pollution control, and sustainable development practices with case studies from around the world.",
    publishYear: 2023,
    isbn: "978-0-567891-23-4",
    pages: 376,
    language: "English",
    publisher: "Environment Press",
    edition: "6th Edition",
    subjects: ["Environmental Science", "Sustainability", "Climate Change", "Ecology"],
    availability: {
      total: 5,
      available: 0,
      borrowed: 5
    },
    location: "Section D - Floor 1",
    callNumber: "577 GRE",
    format: "Hardcover",
    price: "₹2,650"
  },
  {
    id: 7,
    title: "Philosophy of Mind",
    author: "Dr. Rebecca Moore",
    category: "Philosophy",
    image: "/book-1.svg",
    rating: 4.4,
    status: "Available",
    description: "Exploring consciousness, thought, and the nature of mind. This philosophical treatise delves into fundamental questions about consciousness, artificial intelligence, and the relationship between mind and body.",
    publishYear: 2023,
    isbn: "978-0-678912-34-5",
    pages: 302,
    language: "English",
    publisher: "Philosophy Today",
    edition: "2nd Edition",
    subjects: ["Philosophy", "Consciousness", "Cognitive Science", "Ethics"],
    availability: {
      total: 3,
      available: 2,
      borrowed: 1
    },
    location: "Section E - Floor 3",
    callNumber: "128 MOO",
    format: "Paperback",
    price: "₹1,850"
  },
  {
    id: 8,
    title: "Quantum Physics Explained",
    author: "Prof. Alan Cooper",
    category: "Science",
    image: "/book-2.svg",
    rating: 4.8,
    status: "Available",
    description: "Making quantum mechanics accessible to everyone. This book breaks down complex quantum physics concepts into understandable explanations, complete with illustrations and practical applications in modern technology.",
    publishYear: 2024,
    isbn: "978-0-789123-45-6",
    pages: 334,
    language: "English",
    publisher: "Science World",
    edition: "3rd Edition",
    subjects: ["Quantum Physics", "Theoretical Physics", "Modern Physics"],
    availability: {
      total: 4,
      available: 3,
      borrowed: 1
    },
    location: "Section D - Floor 2",
    callNumber: "530.12 COO",
    format: "Hardcover",
    price: "₹3,100"
  },
  {
    id: 9,
    title: "Creative Writing Workshop",
    author: "Emma Thompson",
    category: "Fiction",
    image: "/book-3.svg",
    rating: 4.5,
    status: "Reserved",
    description: "A practical guide to developing your writing skills. This hands-on workshop guide includes exercises, prompts, and techniques for crafting compelling narratives, developing characters, and finding your unique voice.",
    publishYear: 2023,
    isbn: "978-0-891234-56-7",
    pages: 268,
    language: "English",
    publisher: "Writers Guild",
    edition: "1st Edition",
    subjects: ["Creative Writing", "Narrative Techniques", "Character Development"],
    availability: {
      total: 6,
      available: 1,
      borrowed: 4,
      reserved: 1
    },
    location: "Section B - Floor 1",
    callNumber: "808.3 THO",
    format: "Paperback",
    price: "₹1,350"
  },
  {
    id: 10,
    title: "Machine Learning Mastery",
    author: "Dr. Kevin Johnson",
    category: "Technology",
    image: "/book-4.svg",
    rating: 4.9,
    status: "Available",
    description: "Advanced techniques in artificial intelligence and machine learning. This comprehensive guide covers neural networks, deep learning, natural language processing, and computer vision with practical Python implementations.",
    publishYear: 2024,
    isbn: "978-0-912345-67-8",
    pages: 512,
    language: "English",
    publisher: "AI Publications",
    edition: "2nd Edition",
    subjects: ["Machine Learning", "Artificial Intelligence", "Neural Networks", "Deep Learning"],
    availability: {
      total: 8,
      available: 5,
      borrowed: 3
    },
    location: "Section C - Floor 3",
    callNumber: "006.31 JOH",
    format: "Hardcover",
    price: "₹4,200"
  },
  {
    id: 11,
    title: "History of Ancient Civilizations",
    author: "Dr. Maria Rodriguez",
    category: "History",
    image: "/book-5.svg",
    rating: 4.6,
    status: "Available",
    description: "A comprehensive journey through ancient civilizations from Mesopotamia to the Roman Empire. This book explores the rise and fall of great civilizations, their contributions to human knowledge, and their lasting impact on modern society.",
    publishYear: 2023,
    isbn: "978-0-567123-89-0",
    pages: 456,
    language: "English",
    publisher: "Historical Society Press",
    edition: "4th Edition",
    subjects: ["Ancient History", "Civilizations", "Archaeology", "Cultural Studies"],
    availability: {
      total: 7,
      available: 5,
      borrowed: 2
    },
    location: "Section F - Floor 2",
    callNumber: "930 ROD",
    format: "Hardcover",
    price: "₹2,950"
  },
  {
    id: 12,
    title: "Modern Psychology",
    author: "Dr. Robert Kim",
    category: "Psychology",
    image: "/book-6.svg",
    rating: 4.7,
    status: "Available",
    description: "Understanding human behavior and mental processes in the 21st century. This textbook covers cognitive psychology, social psychology, developmental psychology, and clinical applications with current research findings.",
    publishYear: 2024,
    isbn: "978-0-234789-01-2",
    pages: 398,
    language: "English",
    publisher: "Psychology Press",
    edition: "8th Edition",
    subjects: ["Psychology", "Cognitive Science", "Behavioral Studies", "Mental Health"],
    availability: {
      total: 9,
      available: 6,
      borrowed: 3
    },
    location: "Section G - Floor 1",
    callNumber: "150 KIM",
    format: "Paperback",
    price: "₹2,450"
  }
];

export default function BooksPage() {
  const [books, setBooks] = useState(allBooks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedBook, setSelectedBook] = useState<typeof allBooks[0] | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;

  // Get unique categories
  const categories = [...new Set(books.map(book => book.category))];

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

  // Filter and sort books
  const filteredBooks = books
    .filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || book.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "author":
          aValue = a.author;
          bValue = b.author;
          break;
        case "year":
          aValue = a.publishYear;
          bValue = b.publishYear;
          break;
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        case "pages":
          aValue = a.pages;
          bValue = b.pages;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);

  const openBookModal = (book: typeof allBooks[0]) => {
    setSelectedBook(book);
    setShowBookModal(true);
  };

  const closeBookModal = () => {
    setShowBookModal(false);
    setSelectedBook(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-indigo-800/20 to-purple-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span className="text-blue-100 font-medium">Complete Collection</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Explore Our Books
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover thousands of books across multiple categories. Search, filter, and find detailed information about every book in our comprehensive digital library.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-blue-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <span className="font-semibold">{allBooks.length} Total Books</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-blue-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              </svg>
              <span className="font-semibold">{categories.length} Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Search */}
              <div className="lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search Books</label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by title, author, subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-gray-700 pl-10"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-gray-700"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Checked Out">Checked Out</option>
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-2">Sort by:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
                  >
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="year">Year</option>
                    <option value="rating">Rating</option>
                    <option value="pages">Pages</option>
                  </select>
                </div>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                  </span>
                  <svg className={`w-4 h-4 text-blue-600 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Showing {paginatedBooks.length} of {filteredBooks.length} books
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">No Books Found</h2>
              <p className="text-gray-600 mb-6">
                No books match your current search and filter criteria. Try adjusting your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setSortBy("title");
                  setSortOrder("asc");
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {paginatedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 group cursor-pointer"
                    onClick={() => openBookModal(book)}
                  >
                    <div className="relative h-56 md:h-64">
                      <Image
                        src={book.image}
                        alt={book.title}
                        fill
                        className="object-contain bg-gradient-to-br from-blue-50 to-indigo-50"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            book.status === "Available"
                              ? "bg-green-100 text-green-800"
                              : book.status === "Reserved"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {book.status}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs font-semibold text-gray-700">{book.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 md:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-blue-600 text-xs md:text-sm font-medium bg-blue-100 px-2 py-1 rounded-full">
                          {book.category}
                        </span>
                        <span className="text-gray-500 text-xs md:text-sm">{book.publishYear}</span>
                      </div>
                      
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 mb-2 text-sm md:text-base">by {book.author}</p>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{book.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Pages: {book.pages}</span>
                          <span>{book.language}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Available: {book.availability.available}/{book.availability.total}</span>
                          <span className="font-semibold text-blue-600">{book.price}</span>
                        </div>
                        
                        <div className="flex justify-center pt-3 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(book.id);
                            }}
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
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white border border-blue-200 text-gray-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-blue-200 text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white border border-blue-200 text-gray-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Book Details Modal */}
      {showBookModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Book Details</h2>
                <button
                  onClick={closeBookModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Book Image */}
                  <div className="lg:col-span-1">
                    <div className="relative h-80 lg:h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={selectedBook.image}
                        alt={selectedBook.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    </div>
                    
                    {/* Availability Status */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-3">Availability</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Copies:</span>
                          <span className="font-medium">{selectedBook.availability.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-medium text-green-600">{selectedBook.availability.available}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Borrowed:</span>
                          <span className="font-medium text-blue-600">{selectedBook.availability.borrowed}</span>
                        </div>
                        {selectedBook.availability.reserved && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Reserved:</span>
                            <span className="font-medium text-yellow-600">{selectedBook.availability.reserved}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Book Information */}
                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      {/* Title and Author */}
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedBook.title}</h1>
                        <p className="text-xl text-gray-600 mb-4">by {selectedBook.author}</p>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-semibold text-gray-900">{selectedBook.rating}/5</span>
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            selectedBook.status === "Available"
                              ? "bg-green-100 text-green-800"
                              : selectedBook.status === "Reserved"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {selectedBook.status}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                        <p className="text-gray-700 leading-relaxed">{selectedBook.description}</p>
                      </div>

                      {/* Book Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Publication Details</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Publisher:</span>
                              <span className="font-medium">{selectedBook.publisher}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Year:</span>
                              <span className="font-medium">{selectedBook.publishYear}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Edition:</span>
                              <span className="font-medium">{selectedBook.edition}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">ISBN:</span>
                              <span className="font-medium">{selectedBook.isbn}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pages:</span>
                              <span className="font-medium">{selectedBook.pages}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Language:</span>
                              <span className="font-medium">{selectedBook.language}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Format:</span>
                              <span className="font-medium">{selectedBook.format}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-medium text-blue-600">{selectedBook.price}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Library Information</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Category:</span>
                              <span className="font-medium">{selectedBook.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Location:</span>
                              <span className="font-medium">{selectedBook.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Call Number:</span>
                              <span className="font-medium">{selectedBook.callNumber}</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Subjects</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedBook.subjects.map((subject, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                        <button
                          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                            selectedBook.status === "Available"
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : selectedBook.status === "Reserved"
                              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                          disabled={selectedBook.status === "Checked Out"}
                        >
                          {selectedBook.status === "Available" ? "Borrow Book" : 
                           selectedBook.status === "Reserved" ? "Join Waiting List" : "Currently Unavailable"}
                        </button>
                        
                        <button
                          onClick={() => toggleFavorite(selectedBook.id)}
                          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                            favorites.includes(selectedBook.id)
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-500"
                          }`}
                        >
                          <svg className="w-5 h-5" fill={favorites.includes(selectedBook.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {favorites.includes(selectedBook.id) ? "Remove from Favorites" : "Add to Favorites"}
                        </button>
                      </div>
                    </div>
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
