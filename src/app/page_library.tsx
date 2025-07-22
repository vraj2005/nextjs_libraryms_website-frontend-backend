"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const sliderData = [
	{
		title: "Welcome to Your Digital Library",
		subtitle: "DISCOVER KNOWLEDGE",
		offer: "Free Access",
		desc: "Explore thousands of books, journals, and digital resources from the comfort of your home.",
		price: "",
		btn: "Browse Collection",
		btnUrl: "/browse",
		bg: "#e0f2fe",
		bannerType: "library",
	},
	{
		title: "Academic Excellence Awaits",
		subtitle: "RESEARCH & STUDY",
		offer: "24/7 Access",
		desc: "Access peer-reviewed journals, research papers, and academic databases anytime.",
		price: "",
		btn: "Academic Resources",
		btnUrl: "/academic",
		bg: "#f0f9ff",
		bannerType: "academic",
	},
];

const categories = [
	{
		name: "Fiction",
		icon: "📚",
		description: "Novels & Stories",
		count: "2,450+ books"
	},
	{
		name: "Non-Fiction",
		icon: "📖",
		description: "Biographies & Essays",
		count: "1,890+ books"
	},
	{
		name: "Academic",
		icon: "🎓",
		description: "Textbooks & Research",
		count: "3,200+ resources"
	},
	{
		name: "Journals",
		icon: "📰",
		description: "Periodicals & Magazines",
		count: "890+ publications"
	},
	{
		name: "Reference",
		icon: "📕",
		description: "Dictionaries & Encyclopedias",
		count: "450+ references"
	},
	{
		name: "Digital",
		icon: "💻",
		description: "E-books & Audio",
		count: "5,670+ digital"
	},
	{
		name: "Children",
		icon: "🧸",
		description: "Kids & Young Adult",
		count: "1,230+ books"
	},
	{
		name: "Archives",
		icon: "📜",
		description: "Historical Documents",
		count: "780+ archives"
	},
];

const featuredBooks = [
	{
		id: 1,
		title: "The Midnight Library",
		author: "Matt Haig",
		image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
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
		image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
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
		image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop",
		category: "Academic",
		isbn: "978-0132350884",
		rating: 4.6,
		status: "Borrowed",
		publisher: "Prentice Hall",
		year: 2008,
		description: "A handbook of agile software craftsmanship for professional developers."
	},
	{
		id: 4,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
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
		image: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=300&h=400&fit=crop",
		category: "Mystery",
		isbn: "978-1250301697",
		rating: 4.3,
		status: "Reserved",
		publisher: "Celadon Books",
		year: 2019,
		description: "A psychological thriller about a woman who refuses to speak after murdering her husband."
	},
	{
		id: 6,
		title: "Atomic Habits",
		author: "James Clear",
		image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop",
		category: "Self-Help",
		isbn: "978-0735211292",
		rating: 4.9,
		status: "Available",
		publisher: "Avery",
		year: 2018,
		description: "An easy & proven way to build good habits & break bad ones."
	},
];

export default function Home() {
	const [current, setCurrent] = useState(0);
	const slide = sliderData[current];

	// Autoplay effect
	useEffect(() => {
		const timer = setTimeout(() => {
			setCurrent((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1));
		}, 5000);
		return () => clearTimeout(timer);
	}, [current]);

	const prevSlide = () =>
		setCurrent((prev) => (prev === 0 ? sliderData.length - 1 : prev - 1));
	const nextSlide = () =>
		setCurrent((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1));

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Available": return "bg-green-100 text-green-800";
			case "Borrowed": return "bg-red-100 text-red-800";
			case "Reserved": return "bg-yellow-100 text-yellow-800";
			default: return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex flex-col items-center py-6 md:py-10">
			{/* Hero Slider */}
			<section className="w-full max-w-7xl mx-auto px-4 mb-8 md:mb-12">
				<div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
					<div
						className="relative flex items-center justify-center min-h-[300px] md:min-h-[500px] rounded-3xl"
						style={{ background: slide.bg }}
					>
						{/* Background Pattern */}
						<div className="absolute inset-0 opacity-10">
							<svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
								<defs>
									<pattern id="books" patternUnits="userSpaceOnUse" width="20" height="20">
										<rect width="20" height="20" fill="none"/>
										<text x="2" y="10" fontSize="8" fill="currentColor">📚</text>
									</pattern>
								</defs>
								<rect width="100" height="100" fill="url(#books)"/>
							</svg>
						</div>
						
						{/* Navigation Buttons */}
						<button
							onClick={prevSlide}
							aria-label="Previous Slide"
							className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-sky-700 hover:text-sky-900 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xl md:text-2xl shadow-lg border border-sky-100 transition focus:outline-none focus:ring-2 focus:ring-sky-300"
						>
							<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
							</svg>
						</button>
						<button
							onClick={nextSlide}
							aria-label="Next Slide"
							className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-sky-700 hover:text-sky-900 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xl md:text-2xl shadow-lg border border-sky-100 transition focus:outline-none focus:ring-2 focus:ring-sky-300"
						>
							<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
							</svg>
						</button>

						{/* Content */}
						<div className="relative z-20 flex flex-col items-center justify-center text-center w-full px-4 md:px-8">
							<div className="text-sm md:text-base font-bold text-sky-600 mb-4 tracking-wider uppercase drop-shadow-lg">
								{slide.subtitle} <span className="text-amber-600">{slide.offer}</span>
							</div>
							<h1 className="text-2xl md:text-4xl lg:text-6xl font-extrabold text-gray-800 mb-4 md:mb-6 leading-tight drop-shadow-lg max-w-4xl">
								{slide.title}
							</h1>
							<p className="text-gray-700 mb-6 md:mb-8 text-sm md:text-lg font-medium drop-shadow-lg max-w-2xl mx-auto">
								{slide.desc}
							</p>
							<a
								href={slide.btnUrl}
								className="inline-block px-6 md:px-8 py-3 md:py-4 bg-sky-600 text-white rounded-xl shadow-lg hover:bg-sky-700 transition font-bold text-sm md:text-lg transform hover:scale-105"
								aria-label="Browse Collection"
							>
								{slide.btn}
							</a>
						</div>

						{/* Decorative Elements */}
						<div className="absolute bottom-6 left-6 text-4xl md:text-6xl opacity-20 animate-bounce">📚</div>
						<div className="absolute top-6 right-6 text-3xl md:text-5xl opacity-15 animate-pulse">🎓</div>
						<div className="absolute bottom-12 right-12 text-2xl md:text-4xl opacity-25 animate-bounce" style={{animationDelay: '1s'}}>📖</div>
					</div>
				</div>
			</section>

			{/* Categories Section */}
			<section className="w-full max-w-7xl mx-auto px-4 mb-8 md:mb-16">
				<div className="text-center mb-8 md:mb-12">
					<h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">Browse by Category</h2>
					<p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">Discover our vast collection organized by topics and genres</p>
				</div>
				
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
					{categories.map((cat, idx) => (
						<div
							key={cat.name}
							className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 cursor-pointer group border border-gray-100 hover:border-sky-300 transform hover:-translate-y-2"
							tabIndex={0}
							aria-label={cat.name}
						>
							<div className="text-3xl md:text-4xl mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
								{cat.icon}
							</div>
							<h3 className="font-semibold text-sm md:text-lg text-gray-800 group-hover:text-sky-600 transition-colors duration-200 tracking-wide text-center mb-1">
								{cat.name}
							</h3>
							<p className="text-xs text-gray-500 text-center mb-1">{cat.description}</p>
							<p className="text-xs font-medium text-sky-600">{cat.count}</p>
						</div>
					))}
				</div>
			</section>

			{/* Featured Books Section */}
			<section className="w-full max-w-7xl mx-auto px-4 mb-8 md:mb-16">
				<div className="text-center mb-8 md:mb-12">
					<h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">Featured Books</h2>
					<p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">Discover our carefully curated selection of must-read books</p>
				</div>
				
				{/* Category Tabs */}
				<div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-gray-200 pb-4">
					{["ALL", "FICTION", "NON-FICTION", "ACADEMIC", "NEW ARRIVALS", "POPULAR"].map((tab, idx) => (
						<button
							key={tab}
							className={`px-3 md:px-4 py-2 font-medium text-xs md:text-sm transition-colors duration-200 rounded-lg ${
								idx === 0 
									? "bg-sky-600 text-white shadow-md" 
									: "text-gray-600 hover:text-sky-600 hover:bg-sky-50"
							}`}
						>
							{tab}
						</button>
					))}
				</div>

				{/* Books Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
					{featuredBooks.map((book) => (
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
								{/* Hover Overlay with Actions */}
								<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
									<button 
										className="bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
										aria-label="Add to Favorites"
									>
										<svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
										</svg>
									</button>
									<button 
										className="bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100"
										aria-label="Quick Preview"
									>
										<svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									</button>
								</div>
							</div>
							<div className="p-3 md:p-4">
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
									className={`w-full py-2 rounded-lg font-semibold text-xs md:text-sm transition-colors duration-200 flex items-center justify-center gap-2 ${
										book.status === 'Available' 
											? 'bg-sky-600 text-white hover:bg-sky-700' 
											: book.status === 'Reserved'
											? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
											: 'bg-gray-100 text-gray-500 cursor-not-allowed'
									}`}
									disabled={book.status !== 'Available'}
								>
									{book.status === 'Available' && (
										<>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
											</svg>
											BORROW BOOK
										</>
									)}
									{book.status === 'Borrowed' && 'CURRENTLY BORROWED'}
									{book.status === 'Reserved' && 'RESERVED'}
								</button>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Library Stats Banner */}
			<section className="w-full max-w-7xl mx-auto px-4 mb-8 md:mb-16">
				<div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-3xl p-6 md:p-12 text-white text-center shadow-2xl">
					<h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Our Library by Numbers</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
						<div className="bg-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
							<div className="text-2xl md:text-4xl font-bold mb-2">15,000+</div>
							<div className="text-sm md:text-base opacity-90">Total Books</div>
						</div>
						<div className="bg-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
							<div className="text-2xl md:text-4xl font-bold mb-2">2,500+</div>
							<div className="text-sm md:text-base opacity-90">Active Members</div>
						</div>
						<div className="bg-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
							<div className="text-2xl md:text-4xl font-bold mb-2">50+</div>
							<div className="text-sm md:text-base opacity-90">Daily Visitors</div>
						</div>
						<div className="bg-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
							<div className="text-2xl md:text-4xl font-bold mb-2">24/7</div>
							<div className="text-sm md:text-base opacity-90">Digital Access</div>
						</div>
					</div>
				</div>
			</section>

			{/* Quick Actions Section */}
			<section className="w-full max-w-7xl mx-auto px-4 mb-8 md:mb-16">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
					{/* Reserve a Study Room */}
					<div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-sky-300">
						<div className="flex items-center mb-4">
							<div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mr-4">
								<svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<h3 className="text-lg md:text-xl font-bold text-gray-800">Reserve Study Room</h3>
						</div>
						<p className="text-gray-600 mb-4 text-sm md:text-base">Book a quiet study space for individual or group study sessions.</p>
						<button className="w-full bg-sky-600 text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors text-sm md:text-base">
							Book Now
						</button>
					</div>

					{/* Request Book */}
					<div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-amber-300">
						<div className="flex items-center mb-4">
							<div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
								<svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
								</svg>
							</div>
							<h3 className="text-lg md:text-xl font-bold text-gray-800">Request a Book</h3>
						</div>
						<p className="text-gray-600 mb-4 text-sm md:text-base">Can't find what you're looking for? Request a new book for our collection.</p>
						<button className="w-full bg-amber-600 text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors text-sm md:text-base">
							Submit Request
						</button>
					</div>

					{/* Digital Resources */}
					<div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-300">
						<div className="flex items-center mb-4">
							<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
								<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
							</div>
							<h3 className="text-lg md:text-xl font-bold text-gray-800">Digital Resources</h3>
						</div>
						<p className="text-gray-600 mb-4 text-sm md:text-base">Access e-books, audiobooks, and digital databases from anywhere.</p>
						<button className="w-full bg-purple-600 text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm md:text-base">
							Access Portal
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}
