"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

// Types aligned with Prisma schema
interface CategoryOption { id: string; name: string; }
interface BookRecord {
	id: string;
	isbn: string;
	title: string;
	author: string;
	description?: string | null;
	categoryId: string;
	category: { id: string; name: string };
	image?: string | null;
	totalCopies: number;
	availableCopies: number;
	publishedYear?: number | null;
	publisher?: string | null;
	isActive: boolean;
	isFeatured: boolean;
	createdAt: string;
	updatedAt: string;
}

type EditableFields = Partial<Pick<BookRecord, "title" | "author" | "description" | "categoryId" | "image" | "totalCopies" | "publishedYear" | "publisher" | "isFeatured" | "isActive" >>;

export default function AdminBooks() {
	const { token } = useAuth();
	const searchParams = useSearchParams();
	const router = useRouter();
	const [books, setBooks] = useState<BookRecord[]>([]);
	const [categories, setCategories] = useState<CategoryOption[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all"); // all | available | unavailable
	const [sortBy, setSortBy] = useState("title");
	const [currentPage, setCurrentPage] = useState(1);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [form, setForm] = useState<EditableFields>({});
	const booksPerPage = 10;

	// Initial load: fetch categories & books
	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const [catRes, bookRes] = await Promise.all([
					fetch("/api/categories"),
					// Fetch a large limit to approximate "all"
					fetch(`/api/books?limit=1000&sortBy=${sortBy}&sortOrder=asc`)
				]);
				const catData = await catRes.json();
				const bookData = await bookRes.json();
				if (catData.categories) setCategories(catData.categories);
				if (bookData.books) setBooks(bookData.books);
			} catch (err) {
				console.error("Failed to load books/categories", err);
				setBooks([]);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [sortBy]);

	// Open add modal if query param add=1
	useEffect(() => {
		const addParam = searchParams.get('add');
		if (addParam === '1') {
			setShowAddModal(true);
			// Clean URL (replace state) to avoid reopening on close/back
			const params = new URLSearchParams(searchParams.toString());
			params.delete('add');
			router.replace(`/admin/books${params.toString() ? '?' + params.toString() : ''}`);
		}
	}, [searchParams, router]);

	// Derived filtered books
	const filteredBooks = useMemo(() => {
		let list = [...books];
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(b =>
				b.title.toLowerCase().includes(q) ||
				b.author.toLowerCase().includes(q) ||
				b.isbn.toLowerCase().includes(q) ||
				(b.publisher?.toLowerCase().includes(q) ?? false)
			);
		}
		if (selectedCategory !== "all") {
			list = list.filter(b => b.categoryId === selectedCategory);
		}
		if (selectedStatus !== "all") {
			if (selectedStatus === "available") list = list.filter(b => b.availableCopies > 0);
			if (selectedStatus === "unavailable") list = list.filter(b => b.availableCopies === 0);
		}
		// local sort (API sorts by base field already but we may adjust)
		list.sort((a, b) => {
			switch (sortBy) {
				case "author": return a.author.localeCompare(b.author);
				case "category": return a.category.name.localeCompare(b.category.name);
				case "createdAt": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				default: return a.title.localeCompare(b.title);
			}
		});
		return list;
	}, [books, searchQuery, selectedCategory, selectedStatus, sortBy]);

	const totalPages = Math.ceil(filteredBooks.length / booksPerPage) || 1;
	const startIndex = (currentPage - 1) * booksPerPage;
	const paginatedBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);

	const resetForm = () => setForm({ title: "", author: "", categoryId: "", isActive: true, isFeatured: false });

	// CRUD operations
	const handleAddBook = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.title || !form.author || !form.categoryId) {
			alert("Title, Author & Category required");
			return;
		}
		setSubmitting(true);
		try {
			const res = await fetch("/api/books", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					title: form.title,
					author: form.author,
					description: form.description ?? undefined,
					categoryId: form.categoryId,
					image: form.image ?? undefined,
					totalCopies: form.totalCopies ? Math.max(1, Number(form.totalCopies)) : 1,
					publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
					publisher: form.publisher ?? undefined,
					isFeatured: form.isFeatured ?? false,
					isActive: form.isActive !== undefined ? form.isActive : true
				})
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to create book");
			setBooks(prev => [data.book, ...prev]);
			setShowAddModal(false);
			resetForm();
		} catch (err: any) {
			alert(err.message);
		} finally { setSubmitting(false); }
	};

	const handleEditBook = (book: BookRecord) => {
		setSelectedBook(book);
		setForm({
			title: book.title,
			author: book.author,
			description: book.description ?? "",
			categoryId: book.categoryId,
			image: book.image ?? "",
			totalCopies: book.totalCopies,
			publishedYear: book.publishedYear ?? undefined,
			publisher: book.publisher ?? "",
			isFeatured: book.isFeatured,
			isActive: book.isActive
		});
		setShowEditModal(true);
	};

	const handleUpdateBook = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedBook) return;
		if (!form.title || !form.author || !form.categoryId) {
			alert("Title, Author & Category required");
			return;
		}
		setSubmitting(true);
		try {
			const res = await fetch(`/api/books/${selectedBook.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					title: form.title,
					author: form.author,
					description: form.description ?? null,
					categoryId: form.categoryId,
					image: form.image ?? null,
					totalCopies: form.totalCopies ? Number(form.totalCopies) : undefined,
					publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
					publisher: form.publisher ?? null,
					isFeatured: form.isFeatured,
					isActive: form.isActive
				})
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to update book");
			setBooks(prev => prev.map(b => b.id === data.book.id ? data.book : b));
			setShowEditModal(false);
			setSelectedBook(null);
			resetForm();
		} catch (err: any) {
			alert(err.message);
		} finally { setSubmitting(false); }
	};

	const handleDeleteBook = async (id: string) => {
		if (!confirm("Delete this book?")) return;
		try {
			const res = await fetch(`/api/books/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` }
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to delete");
			setBooks(prev => prev.filter(b => b.id !== id));
		} catch (err: any) {
			alert(err.message);
		}
	};

	const availableSum = books.reduce((sum, b) => sum + b.availableCopies, 0);
	const borrowedSum = books.reduce((sum, b) => sum + (b.totalCopies - b.availableCopies), 0);

	// Helper to render an image that might be remote (domain not whitelisted) without breaking
	const SafeBookImage: React.FC<{ src?: string | null; alt: string; className?: string; w?: number; h?: number; }> = ({ src, alt, className = '', w = 48, h = 64 }) => {
		const fallback = '/book-1.svg';
		if (!src) return <Image src={fallback} alt={alt} width={w} height={h} className={className} />;
		try {
			const url = new URL(src, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
			const allowed = [
				'images.unsplash.com',
				'cdn-icons-png.flaticon.com',
				'png.pngtree.com',
				'th.bing.com',
				'www.pngall.com',
				'pngimg.com',
				'static.vecteezy.com',
				'file.aiquickdraw.com',
				'www.citypng.com'
			];
			if (allowed.includes(url.hostname)) {
				return <Image src={src} alt={alt} width={w} height={h} className={className} />;
			}
			// Non-allowed domain: use plain img tag (no optimization) to avoid Next.js domain error
			return <img src={src} alt={alt} width={w} height={h} className={className} onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallback; }} />;
		} catch {
			return <Image src={fallback} alt={alt} width={w} height={h} className={className} />;
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex justify-between items-start mb-6">
						<div className="flex items-center space-x-4">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
								<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
								</svg>
							</div>
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
									Books Management
								</h1>
								<p className="text-gray-600">
									Manage your library&apos;s book collection and catalog
								</p>
							</div>
						</div>
						<button
							onClick={() => {
								resetForm();
								setShowAddModal(true);
							}}
							className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
					<div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
									<svg
										className="w-6 h-6 text-white"
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
							<div className="ml-5">
								<p className="text-sm font-medium text-gray-600">
									Total Books
								</p>
								<p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
									{books.length}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
									<svg
										className="w-6 h-6 text-white"
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
							<div className="ml-5">
								<p className="text-sm font-medium text-gray-600">
									Available
								</p>
								<p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">{availableSum}</p>
							</div>
						</div>
					</div>

					<div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
									<svg
										className="w-6 h-6 text-white"
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
							<div className="ml-5">
								<p className="text-sm font-medium text-gray-600">
									Borrowed
								</p>
								<p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">{borrowedSum}</p>
							</div>
						</div>
					</div>

					<div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
									<svg
										className="w-6 h-6 text-white"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
										/>
									</svg>
								</div>
							</div>
							<div className="ml-5">
								<p className="text-sm font-medium text-gray-600">
									Featured
								</p>
								<p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
									{books.filter(book => book.isFeatured).length}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Search and Filters */}
				<div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-8">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						<div className="md:col-span-2">
							<label
								htmlFor="search"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Search Books
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
								</div>
								<input
									type="text"
									id="search"
									placeholder="Search by title, author, ISBN, or call number..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
								/>
							</div>
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
								className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white/80 backdrop-blur-sm transition-all duration-300"
							>
								<option value="all">All Categories</option>
									{categories.map(c => (
										<option key={c.id} value={c.id}>{c.name}</option>
									))}
							</select>
						</div>
						<div>
							<label
								htmlFor="status"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Status
							</label>
							<select
								id="status"
								value={selectedStatus}
								onChange={(e) => setSelectedStatus(e.target.value)}
								className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white/80 backdrop-blur-sm transition-all duration-300"
							>
								<option value="all">All Status</option>
				  				<option value="available">Available</option>
				  				<option value="unavailable">Unavailable</option>
							</select>
						</div>
					</div>
					
					{/* Quick Filters */}
					<div className="mt-6 flex flex-wrap gap-3">
						<button
							onClick={() => {
								setSelectedCategory("all");
								setSelectedStatus("all");
								setSearchQuery("");
							}}
							className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium"
						>
							Clear Filters
						</button>
						<button
							onClick={() => setSelectedStatus("available")}
							className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
								selectedStatus === "available"
									? "bg-emerald-100 text-emerald-700 border border-emerald-200"
									: "bg-white hover:bg-emerald-50 text-gray-700 border border-gray-200"
							}`}
						>
							Available Only
						</button>
						<button
							onClick={() => {
								setSearchQuery("");
								setSelectedCategory("all");
								setSelectedStatus("all");
								setSortBy("title");
							}}
							className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200 text-sm font-medium border border-blue-200"
						>
							Reset All
						</button>
					</div>
					
					<div className="mt-6 flex justify-between items-center">
						<div className="flex items-center space-x-4">
							<p className="text-sm text-gray-600">
								Showing <span className="font-semibold text-gray-900">{paginatedBooks.length}</span> of <span className="font-semibold text-gray-900">{filteredBooks.length}</span> books
							</p>
							{searchQuery && (
								<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
									Filtered by: "{searchQuery}"
								</span>
							)}
						</div>
						<div className="flex items-center space-x-3">
							<label htmlFor="sort" className="text-sm text-gray-600 font-medium">
								Sort by:
							</label>
							<select
								id="sort"
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
							>
								<option value="title">Title</option>
								<option value="author">Author</option>
								<option value="category">Category</option>
								<option value="createdAt">Date Added</option>
							</select>
						</div>
					</div>
				</div>

				{/* Books Table */}
				<div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-200/50">
						<h3 className="text-lg font-semibold text-gray-900">Book Collection</h3>
						<p className="text-sm text-gray-600 mt-1">Manage and organize your library's books</p>
					</div>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200/50">
							<thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
								<tr>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
										Book
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
										Author
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
										Category
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
										ISBN
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
										Availability
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white/50 divide-y divide-gray-200/50">
							{paginatedBooks.map((book, index) => (
								<tr key={book.id} className="hover:bg-white/80 transition-colors duration-200 group">
									<td className="px-6 py-4">
										<div className="flex items-center space-x-4">
											<div className="flex-shrink-0 h-16 w-12">
												<SafeBookImage 
													src={book.image || undefined} 
													alt={book.title} 
													w={48} 
													h={64} 
													className="h-16 w-12 object-cover bg-gray-100 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200" 
												/>
											</div>
											<div className="min-w-0 flex-1">
												<div className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
													{book.title}
												</div>
												<div className="text-sm text-gray-500 mt-1">
													{book.publishedYear && (
														<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
															{book.publishedYear}
														</span>
													)}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 text-sm text-gray-900 font-medium">{book.author}</td>
									<td className="px-6 py-4">
										<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
											{book.category.name}
										</span>
									</td>
									<td className="px-6 py-4 text-sm text-gray-900 font-mono bg-gray-50/50 rounded-lg mx-2">
										{book.isbn || <span className="text-gray-400 italic">No ISBN</span>}
									</td>
									<td className="px-6 py-4">
										<div className="flex flex-col space-y-2">
											<div className="flex items-center space-x-2">
												<div className={`w-3 h-3 rounded-full ${book.availableCopies > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
												<span className={`text-sm font-medium ${book.availableCopies > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
													{book.availableCopies > 0 ? 'Available' : 'Not Available'}
												</span>
											</div>
											<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
												{book.availableCopies}/{book.totalCopies} copies
											</span>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="flex flex-col space-y-2">
											<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
												book.isFeatured 
													? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border border-amber-200' 
													: 'bg-gray-100 text-gray-600 border border-gray-200'
											}`}>
												{book.isFeatured ? 'Featured' : 'Regular'}
											</span>
											<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
												book.isActive 
													? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200' 
													: 'bg-gradient-to-r from-red-100 to-red-100 text-red-800 border border-red-200'
											}`}>
												{book.isActive ? 'Active' : 'Inactive'}
											</span>
										</div>
									</td>
									<td className="px-6 py-4 text-right">
										<div className="flex justify-end space-x-2">
											<button 
												onClick={() => handleEditBook(book)} 
												aria-label="Edit book" 
												title="Edit" 
												className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 hover:shadow-md group"
											>
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:scale-110 transition-transform duration-200">
													<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
													<path d="M18.375 2.625a1.767 1.767 0 0 1 2.5 2.5L13 13l-4 1 1-4 8.375-8.375Z" />
												</svg>
												<span className="sr-only">Edit</span>
											</button>
											<button 
												onClick={() => handleDeleteBook(book.id)} 
												aria-label="Delete book" 
												title="Delete" 
												className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-105 hover:shadow-md group"
											>
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:scale-110 transition-transform duration-200">
													<path d="M3 6h18" />
													<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
													<path d="M10 11v6" />
													<path d="M14 11v6" />
													<path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
												</svg>
												<span className="sr-only">Delete</span>
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
					<div className="bg-white/70 backdrop-blur-sm border-t border-gray-200/50 px-6 py-4 flex items-center justify-between">
						<div className="flex-1 flex justify-between sm:hidden">
							<button
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
								className="relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white/80 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
							>
								Previous
							</button>
							<button
								onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
								disabled={currentPage === totalPages}
								className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white/80 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
							>
								Next
							</button>
						</div>
						<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
							<div>
								<p className="text-sm text-gray-600">
									Showing{" "}
									<span className="font-semibold text-gray-900">{startIndex + 1}</span> to{" "}
									<span className="font-semibold text-gray-900">
										{Math.min(startIndex + booksPerPage, filteredBooks.length)}
									</span>{" "}
									of{" "}
									<span className="font-semibold text-gray-900">{filteredBooks.length}</span>{" "}
									results
								</p>
							</div>
							<div>
								<nav className="relative z-0 inline-flex rounded-xl shadow-sm space-x-1" aria-label="Pagination">
									<button
										onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
										disabled={currentPage === 1}
										className="relative inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white/80 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
									>
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
										</svg>
										<span className="ml-1">Previous</span>
									</button>
									
									{/* Smart pagination with ellipsis */}
									{(() => {
										const delta = 2;
										const range = [];
										const rangeWithDots = [];
										
										for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
											range.push(i);
										}
										
										if (currentPage - delta > 2) {
											rangeWithDots.push(1, '...');
										} else {
											rangeWithDots.push(1);
										}
										
										rangeWithDots.push(...range);
										
										if (currentPage + delta < totalPages - 1) {
											rangeWithDots.push('...', totalPages);
										} else if (totalPages > 1) {
											rangeWithDots.push(totalPages);
										}
										
										return rangeWithDots.map((page, index) => {
											if (page === '...') {
												return (
													<span key={`ellipsis-${index}`} className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500">
														...
													</span>
												);
											}
											
											return (
												<button
													key={page}
													onClick={() => setCurrentPage(page as number)}
													className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
														currentPage === page
															? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105"
															: "bg-white/80 border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
													}`}
												>
													{page}
												</button>
											);
										});
									})()}
									
									<button
										onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
										disabled={currentPage === totalPages}
										className="relative inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white/80 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
									>
										<span className="mr-1">Next</span>
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
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
				<div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
					<div className="relative bg-white/95 backdrop-blur-sm border border-white/20 w-full max-w-2xl shadow-2xl rounded-2xl">
						<div className="p-6">
							<div className="flex justify-between items-center mb-6">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
										<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
										</svg>
									</div>
									<h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
										Add New Book
									</h3>
								</div>
								<button
									onClick={() => setShowAddModal(false)}
									className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
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
							<form className="space-y-6" onSubmit={handleAddBook}>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Title <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											name="title"
											required
											value={form.title || ""}
											onChange={(e) =>
												setForm({ ...form, title: e.target.value })
											}
											className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
											placeholder="Enter book title"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Author <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											name="author"
											required
											value={form.author || ""}
											onChange={(e) =>
												setForm({ ...form, author: e.target.value })
											}
											className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
											placeholder="Enter author name"
										/>
									</div>
									
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Category <span className="text-red-500">*</span>
										</label>
										<select
											name="categoryId"
											value={form.categoryId || ''}
											onChange={(e)=> setForm({ ...form, categoryId: e.target.value })}
											required
											className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
										>
																					<option value="">Select Category</option>
																					{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
																				</select>
																		</div>
																		<div>
																			<label className="block text-sm font-medium text-gray-700 mb-2">Total Copies</label>
																			<input type="number" min={1} value={form.totalCopies ?? ''} onChange={e=> setForm({ ...form, totalCopies: Number(e.target.value) || undefined })} className="w-full px-3 py-2 border border-gray-400 rounded-md text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" />
																		</div>
																		<div>
																			<label className="block text-sm font-medium text-gray-700 mb-2">Published Year</label>
																			<input type="number" value={form.publishedYear ?? ''} onChange={e=> setForm({ ...form, publishedYear: Number(e.target.value) || undefined })} className="w-full px-3 py-2 border border-gray-400 rounded-md text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" />
																		</div>
																		<div>
																			<label className="block text-sm font-medium text-gray-700 mb-2">Publisher</label>
																			<input type="text" value={form.publisher ?? ''} onChange={e=> setForm({ ...form, publisher: e.target.value })} className="w-full px-3 py-2 border border-gray-400 rounded-md text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" />
																		</div>
																		<div>
																			<label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
																			<input type="text" value={form.image ?? ''} placeholder="https://..." onChange={e=> setForm({ ...form, image: e.target.value.trim() })} className="w-full px-3 py-2 border border-gray-400 rounded-md text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" />
																			{form.image && (
																				<div className="mt-2 flex items-center space-x-2">
																					<SafeBookImage src={form.image} alt="Preview" w={40} h={56} className="h-14 w-10 object-cover rounded bg-gray-100" />
																					<span className="text-xs text-gray-500">Preview</span>
																				</div>
																			)}
																		</div>
																		<div className="flex items-center space-x-6 mt-2">
																			<label className="inline-flex items-center space-x-2 text-sm text-gray-700">
																				<input id="featuredAdd" type="checkbox" checked={form.isFeatured ?? false} onChange={e=> setForm({ ...form, isFeatured: e.target.checked })} className="h-4 w-4" />
																				<span>Featured</span>
																			</label>
																			<label className="inline-flex items-center space-x-2 text-sm text-gray-700">
																				<input id="activeAdd" type="checkbox" checked={form.isActive ?? true} onChange={e=> setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />
																				<span>Active</span>
																			</label>
																		</div>
																		<div className="md:col-span-2">
																			<label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
																			<textarea rows={4} value={form.description ?? ''} onChange={e=> setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-400 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-y" />
																		</div>
								</div>
								<div className="flex justify-end space-x-4 pt-6">
									<button
										type="button"
										onClick={() => setShowAddModal(false)}
										className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={submitting}
										className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
									>
										{submitting ? (
											<span className="flex items-center">
												<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
												Adding...
											</span>
										) : 'Add Book'}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Edit Book Modal */}
			{showEditModal && selectedBook && (
				<div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
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
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
											className="w-full px-3 py-2 border border-gray-400 rounded-md text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
										/>
									</div>
									{/* ISBN is not editable */}
																		<div>
																			<label className="block text-base font-semibold text-gray-900 mb-2">Category *</label>
																			<select name="categoryId" value={form.categoryId || ''} required onChange={e=> setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 border border-gray-400 rounded-md text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600">
																				<option value="">Select Category</option>
																				{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
																			</select>
																		</div>
																		<div>
																			<label className="block text-base font-semibold text-gray-900 mb-2">Total Copies</label>
																			<input type="number" min={1} value={form.totalCopies ?? ''} onChange={e=> setForm({ ...form, totalCopies: Number(e.target.value) || undefined })} className="w-full px-3 py-2 border border-gray-400 rounded-md text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" />
																		</div>
																		<div>
																			<label className="block text-base font-semibold text-gray-900 mb-2">Published Year</label>
																			<input type="number" value={form.publishedYear ?? ''} onChange={e=> setForm({ ...form, publishedYear: Number(e.target.value) || undefined })} className="w-full px-3 py-2 border border-gray-400 rounded-md text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" />
																		</div>
																		<div>
																			<label className="block text-base font-semibold text-gray-900 mb-2">Publisher</label>
																			<input type="text" value={form.publisher ?? ''} onChange={e=> setForm({ ...form, publisher: e.target.value })} className="w-full px-3 py-2 border border-gray-400 rounded-md text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" />
																		</div>
																		<div>
																			<label className="block text-base font-semibold text-gray-900 mb-2">Image URL</label>
																			<input type="text" value={form.image ?? ''} placeholder="https://..." onChange={e=> setForm({ ...form, image: e.target.value.trim() })} className="w-full px-3 py-2 border border-gray-400 rounded-md text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" />
																			{(form.image || selectedBook.image) && (
																				<div className="mt-2 flex items-center space-x-2">
																					<SafeBookImage src={(form.image || selectedBook.image) || undefined} alt="Preview" w={40} h={56} className="h-14 w-10 object-cover rounded bg-gray-100" />
																					<span className="text-xs text-gray-500">Preview</span>
																				</div>
																			)}
																		</div>
																		<div className="flex items-center space-x-6 mt-2">
																		<label className="inline-flex items-center space-x-2 text-sm text-gray-700">
																			<input id="featuredEdit" type="checkbox" checked={form.isFeatured ?? false} onChange={e=> setForm({ ...form, isFeatured: e.target.checked })} className="h-4 w-4" />
																			<span>Featured</span>
																		</label>
																		<label className="inline-flex items-center space-x-2 text-sm text-gray-700">
																			<input id="activeEdit" type="checkbox" checked={form.isActive ?? true} onChange={e=> setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />
																			<span>Active</span>
																		</label>
																	</div>
																		<div className="md:col-span-2">
																			<label className="block text-base font-semibold text-gray-900 mb-2">Description</label>
																			<textarea rows={4} value={form.description ?? ''} onChange={e=> setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-400 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-y" />
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
		</div>
	);
}
