"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

interface Book {
	id: string;
	title: string;
	author: string;
	category: string;
	image: string;
	rating?: number;
	status?: string;
	description?: string;
	publishYear?: number;
	isbn: string;
	pages?: number;
	language?: string;
	publisher?: string;
	edition?: string;
	subjects?: string[];
	availability?: {
		total: number;
		available: number;
		borrowed: number;
		reserved: number;
	};
	location?: string;
	callNumber?: string;
	format?: string;
	price?: string;
	totalCopies?: number;
	availableCopies?: number;
	borrowedCopies?: number;
	reservedCopies?: number;
	copies?: number;
	available?: number;
	borrowed?: number;
	reserved?: number;
}

export default function AdminBooks() {
	const { token } = useAuth();
	const [books, setBooks] = useState<Book[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [sortBy, setSortBy] = useState("title");
	const [currentPage, setCurrentPage] = useState(1);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedBook, setSelectedBook] = useState<Book | null>(null);
	const [loading, setLoading] = useState(true);
	const [form, setForm] = useState<Partial<Book>>({});
	const router = useRouter();

	const booksPerPage = 10;

	// Fetch books from API
	useEffect(() => {
		const fetchBooks = async () => {
			setLoading(true);
			try {
				const res = await fetch(
					`/api/books?sortBy=${sortBy}&search=${searchQuery}&category=${selectedCategory}&status=${selectedStatus}`
				);
				const data = await res.json();
				setBooks(data.books || []);
			} catch (e) {
				setBooks([]);
			} finally {
				setLoading(false);
			}
		};
		fetchBooks();
	}, [searchQuery, selectedCategory, selectedStatus, sortBy]);

	// Categories for filter
	const categories = [
		"all",
		"Fiction",
		"Non-Fiction", 
		"Science",
		"Technology",
		"History",
		"Biography",
		"Education",
		...Array.from(new Set(books.map(book => book.category))).filter(
			cat => cat && !["Fiction", "Non-Fiction", "Science", "Technology", "History", "Biography", "Education"].includes(cat)
		),
	];

	// Filtered and paginated books
	const filteredBooks = books;
	const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
	const startIndex = (currentPage - 1) * booksPerPage;
	const paginatedBooks = filteredBooks.slice(
		startIndex,
		startIndex + booksPerPage
	);

	// CRUD handlers
	const handleAddBook = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.title || !form.author || !form.isbn) {
			alert("Please fill in all required fields");
			return;
		}
		
		try {
			const bookData = {
				...form,
				copies: Number(form.copies) || 1,
				available: Number(form.copies) || 1,
				borrowed: 0,
				reserved: 0,
				image: "/book-1.svg" // Default image
			};

			const res = await fetch("/api/books", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(bookData),
			});

			if (res.ok) {
				const data = await res.json();
				setBooks(prev => [data.book, ...prev]);
				setShowAddModal(false);
				setForm({});
				alert("Book added successfully!");
			} else {
				alert("Failed to add book");
			}
		} catch (error) {
			alert("Error adding book");
		}
	};

	const handleEditBook = (book: Book) => {
		setSelectedBook(book);
		setForm({ ...book });
		setShowEditModal(true);
	};

	const handleUpdateBook = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.title || !form.author || !form.isbn) {
			alert("Please fill in all required fields");
			return;
		}

		try {
			const res = await fetch("/api/books", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ ...form, copies: Number(form.copies) || 1 }),
			});

			if (res.ok) {
				const data = await res.json();
				setBooks(prev => prev.map(b => b.id === data.book.id ? data.book : b));
				setShowEditModal(false);
				setForm({});
				alert("Book updated successfully!");
			} else {
				alert("Failed to update book");
			}
		} catch (error) {
			alert("Error updating book");
		}
	};

	const handleDeleteBook = async (id: string) => {
		if (!confirm("Are you sure you want to delete this book?")) return;

		try {
			const res = await fetch("/api/books", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ id }),
			});

			if (res.ok) {
				setBooks(prev => prev.filter(b => b.id !== id));
				alert("Book deleted successfully!");
			} else {
				alert("Failed to delete book");
			}
		} catch (error) {
			alert("Error deleting book");
		}
	};

	if (loading) {
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
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Books Management
						</h1>
						<p className="text-gray-600">
							Manage your library&apos;s book collection
						</p>
					</div>
					<button
						onClick={() => {
							setForm({});
							setShowAddModal(true);
						}}
						className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Add New Book
					</button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
									<svg
										className="w-5 h-5 text-blue-600"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
									</svg>
								</div>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-500">
									Total Books
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{books.length}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
									<svg
										className="w-5 h-5 text-green-600"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-500">
									Available
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{books.reduce((sum, book) => sum + (book.available ?? 0), 0)}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
									<svg
										className="w-5 h-5 text-yellow-600"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 8v4l3 3"
										/>
									</svg>
								</div>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-500">
									Borrowed
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{books.reduce((sum, book) => sum + (book.borrowed ?? 0), 0)}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
									<svg
										className="w-5 h-5 text-purple-600"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
										/>
									</svg>
								</div>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-500">
									Reserved
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{books.reduce((sum, book) => sum + (book.reserved ?? 0), 0)}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Search and Filters */}
				<div className="bg-white rounded-lg shadow p-6 mb-8">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="md:col-span-2">
							<label
								htmlFor="search"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Search Books
							</label>
							<input
								type="text"
								id="search"
								placeholder="Search by title, author, ISBN, or call number..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-base font-semibold text-gray-900 placeholder-gray-600 bg-white disabled:text-gray-700 disabled:bg-gray-100"
							/>
						</div>
						<div>
							<label
								htmlFor="category"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Category
							</label>
							<select
								id="category"
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
								className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-base font-semibold text-gray-900 bg-white disabled:text-gray-700 disabled:bg-gray-100"
							>
								<option value="all">All Categories</option>
								{categories.map((category) => ( 
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>
						<div>
							<label
								htmlFor="status"
								className="block text-base font-semibold text-gray-900 mb-2"
							>
								Status
							</label>
							<select
								id="status"
								value={selectedStatus}
								onChange={(e) => setSelectedStatus(e.target.value)}
								className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-base font-semibold text-gray-900 bg-white disabled:text-gray-700 disabled:bg-gray-100"
							>
								<option value="all">All Status</option>
								<option value="Available">Available</option> 
								<option value="Limited">Limited</option>
								<option value="Out of Stock">Out of Stock</option>
							</select>
						</div>
					</div>
					<div className="mt-4 flex justify-between items-center">
						<p className="text-sm text-gray-600">
							Showing {paginatedBooks.length} of {filteredBooks.length} books
						</p>
						<div className="flex items-center space-x-2">
							<label htmlFor="sort" className="text-sm text-gray-600">
								Sort by:
							</label>
							<select
								id="sort"
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="px-3 py-1 border border-gray-400 rounded-md text-base font-semibold text-gray-900 bg-white disabled:text-gray-700 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
							>
								<option value="title">Title</option> 
								<option value="author">Author</option>
								<option value="category">Category</option>
								<option value="addedDate">Date Added</option>
							</select>
						</div>
					</div>
				</div>

				{/* Books Table */}
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Book
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Author
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Category
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										ISBN
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Availability
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Location
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{paginatedBooks.map((book) => (
									<tr key={book.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-16 w-12">
													<Image
														src={book.image}
														alt={book.title}
														width={48}
														height={64}
														className="h-16 w-12 object-contain bg-gray-100 rounded"
													/>
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900 line-clamp-2">
														{book.title}
													</div>
													<div className="text-sm text-gray-500">
														{book.publishYear}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{book.author}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
												{book.category}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
											{book.isbn}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											<div className="flex flex-col">
												<span
													className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-1 ${
																(book.available ?? 0) > 0
															? "bg-green-100 text-green-800"
															: "bg-red-100 text-red-800"
													}`}
												>
															{(book.available ?? 0) > 0
														? "Available"
														: "Not Available"}
												</span>
												<span className="text-xs text-gray-500">
													{book.available}/{book.copies} available
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<div>
												<div className="font-medium">{book.callNumber}</div>
												<div className="text-xs">{book.location}</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex space-x-2">
												<button
													onClick={() => handleEditBook(book)}
													className="text-blue-600 hover:text-blue-900 transition-colors"
												>
													Edit
												</button>
												<button
													onClick={() => handleDeleteBook(book.id)}
													className="text-red-600 hover:text-red-900 transition-colors"
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
							<div className="flex-1 flex justify-between sm:hidden">
								<button
									onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
									disabled={currentPage === 1}
									className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
								>
									Previous
								</button>
								<button
									onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
									disabled={currentPage === totalPages}
									className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
								>
									Next
								</button>
							</div>
							<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
								<div>
									<p className="text-sm text-gray-700">
										Showing{" "}
										<span className="font-medium">{startIndex + 1}</span> to{" "}
										<span className="font-medium">
											{Math.min(startIndex + booksPerPage, filteredBooks.length)}
										</span>{" "}
										of{" "}
										<span className="font-medium">{filteredBooks.length}</span>{" "}
										results
									</p>
								</div>
								<div>
									<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
										<button
											onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
											disabled={currentPage === 1}
											className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
										>
											Previous
										</button>
										{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
											<button
												key={page}
												onClick={() => setCurrentPage(page)}
												className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
													currentPage === page
														? "z-10 bg-blue-50 border-blue-500 text-blue-600"
														: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
												}`}
											>
												{page}
											</button>
										))}
										<button
											onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
											disabled={currentPage === totalPages}
											className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
										>
											Next
										</button>
									</nav>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Add Book Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									Add New Book
								</h3>
								<button
									onClick={() => setShowAddModal(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
							<form className="space-y-4" onSubmit={handleAddBook}>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Title *
										</label>
										<input
											type="text"
											name="title"
											required
											value={form.title || ""}
											onChange={(e) =>
												setForm({ ...form, title: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Author *
										</label>
										<input
											type="text"
											name="author"
											required
											value={form.author || ""}
											onChange={(e) =>
												setForm({ ...form, author: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											ISBN *
										</label>
										<input
											type="text"
											name="isbn"
											required
											value={form.isbn || ""}
											onChange={(e) =>
												setForm({ ...form, isbn: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Category
										</label>
										<select
											name="category"
											value={form.category || ""}
											onChange={(e) =>
												setForm({ ...form, category: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										>
											<option value="">Select Category</option>
											<option value="Fiction">Fiction</option>
											<option value="Non-Fiction">Non-Fiction</option>
											<option value="Science">Science</option>
											<option value="Technology">Technology</option>
											<option value="History">History</option>
											<option value="Biography">Biography</option>
											<option value="Education">Education</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Total Copies
										</label>
										<input
											type="number"
											name="copies"
											min="1"
											value={form.copies || ""}
											onChange={(e) =>
												setForm({ ...form, copies: Number(e.target.value) || undefined })
											}
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Location
										</label>
										<input
											type="text"
											name="location"
											placeholder="e.g., Shelf A-1"
											value={form.location || ""}
											onChange={(e) =>
												setForm({ ...form, location: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										/>
									</div>
								</div>
								<div className="flex justify-end space-x-3 pt-4">
									<button
										type="button"
										onClick={() => setShowAddModal(false)}
										className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
									>
										Add Book
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Edit Book Modal */}
			{showEditModal && selectedBook && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									Edit Book Details
								</h3>
								<button
									onClick={() => setShowEditModal(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
							<form className="space-y-4" onSubmit={handleUpdateBook}>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-base font-semibold text-gray-900 mb-2">
											Title *
										</label>
										<input
											type="text"
											name="title"
											required
											value={form.title || ""}
											onChange={(e) =>
												setForm({ ...form, title: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										/>
									</div>
									<div>
										<label className="block text-base font-semibold text-gray-900 mb-2">
											Author *
										</label>
										<input
											type="text"
											name="author"
											required
											value={form.author || ""}
											onChange={(e) =>
												setForm({ ...form, author: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										/>
									</div>
									<div>
										<label className="block text-base font-semibold text-gray-900 mb-2">
											ISBN *
										</label>
										<input
											type="text"
											name="isbn"
											required
											value={form.isbn || ""}
											onChange={(e) =>
												setForm({ ...form, isbn: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										/>
									</div>
									<div>
										<label className="block text-base font-semibold text-gray-900 mb-2">
											Category
										</label>
										<select
											name="category"
											value={form.category || ""}
											onChange={(e) =>
												setForm({ ...form, category: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										>
											<option value="">Select Category</option>
											<option value="Fiction">Fiction</option>
											<option value="Non-Fiction">Non-Fiction</option>
											<option value="Science">Science</option>
											<option value="Technology">Technology</option>
											<option value="History">History</option>
											<option value="Biography">Biography</option>
											<option value="Education">Education</option>
										</select>
									</div>
									<div>
										<label className="block text-base font-semibold text-gray-900 mb-2">
											Total Copies
										</label>
										<input
											type="number"
											name="copies"
											min="1"
											value={form.copies || ""}
											onChange={(e) =>
												setForm({ ...form, copies: Number(e.target.value) || undefined })
											}
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										/>
									</div>
									<div>
										<label className="block text-base font-semibold text-gray-900 mb-2">
											Location
										</label>
										<input
											type="text"
											name="location"
											placeholder="e.g., Shelf A-1"
											value={form.location || ""}
											onChange={(e) =>
												setForm({ ...form, location: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										/>
									</div>
								</div>
								<div className="flex justify-end space-x-3 pt-4">
									<button
										type="button"
										onClick={() => setShowEditModal(false)}
										className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
									>
										Update Book
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
