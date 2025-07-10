"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const sliderData = [
	{
		img: "", // No background image
		title: "Lets Go Eat A God Damn Snack",
		subtitle: "LIMITED TIME",
		offer: "-10% OFF",
		desc: "Plant-based, only in fun & complete environments, and for breakthroughs.",
		price: "",
		btn: "Shop Fresh Snack",
		btnUrl: "/shop",
		bg: "#b2e0e0",
		bannerType: "snack",
	},
	{
		img: "https://png.pngtree.com/background/20210711/original/pngtree-orange-fresh-snacks-fries-potato-chips-food-e-commerce-banner-picture-image_1102989.jpg",
		title: "Fresh Snacks & Chips",
		subtitle: "LIMITED TIME",
		offer: "-15% OFF",
		desc: "Snacks for every taste. Grab your deal!",
		price: "from $3.99",
		btn: "Shop Snacks",
		btnUrl: "/snacks",
		bg: "#f7e6c4",
		bannerType: "default",
	},
	// Add more slides if needed
];

const categories = [
	{
		name: "Fashion",
		icon: "https://cdn-icons-png.flaticon.com/512/892/892458.png",
	},
	{
		name: "Electronics",
		icon: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png",
	},
	{
		name: "Bags",
		icon: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
	},
	{
		name: "Footwear",
		icon: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png",
	},
	{
		name: "Groceries",
		icon: "https://cdn-icons-png.flaticon.com/512/1046/1046858.png",
	},
	{
		name: "Beauty",
		icon: "https://cdn-icons-png.flaticon.com/512/3075/3075979.png",
	},
	{
		name: "Wellness",
		icon: "https://cdn-icons-png.flaticon.com/512/3075/3075975.png",
	},
	{
		name: "Jewellery",
		icon: "https://cdn-icons-png.flaticon.com/512/3075/3075978.png",
	},
];

const popularProducts = [
	{
		id: 1,
		brand: "CLAFOUTIS",
		name: "Men Opaque Casual Shirt",
		image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop",
		discount: "10%",
		rating: 5,
		originalPrice: 1650,
		salePrice: 1450,
	},
	{
		id: 2,
		brand: "Campus Sutra",
		name: "Men Comfort Cuban Collar Shirt",
		image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=300&fit=crop",
		discount: "14%",
		rating: 5,
		originalPrice: 2200,
		salePrice: 1850,
	},
	{
		id: 3,
		brand: "Allen Solly",
		name: "Men Pure Cotton Striped Casual Shirt",
		image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop",
		discount: "10%",
		rating: 4,
		originalPrice: 2250,
		salePrice: 1999,
	},
	{
		id: 4,
		brand: "all about you",
		name: "Embroidered Satin Saree",
		image: "https://images.unsplash.com/photo-1594736797933-d0302ba40d23?w=300&h=300&fit=crop",
		discount: "13%",
		rating: 5,
		originalPrice: 5500,
		salePrice: 4785,
	},
	{
		id: 5,
		brand: "kasee",
		name: "Embellished Embroidered Saree",
		image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=300&fit=crop",
		discount: "12%",
		rating: 5,
		originalPrice: 1999,
		salePrice: 1955,
	},
	{
		id: 6,
		brand: "Koskii",
		name: "Floral Beads and Stones Pendant",
		image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop",
		discount: "8%",
		rating: 3,
		originalPrice: 2450,
		salePrice: 1850,
	},
];

export default function Home() {
	const [current, setCurrent] = useState(0);
	const slide = sliderData[current];

	// Autoplay effect
	useEffect(() => {
		const timer = setTimeout(() => {
			setCurrent((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1));
		}, 4000);
		return () => clearTimeout(timer);
	}, [current]);

	const prevSlide = () =>
		setCurrent((prev) => (prev === 0 ? sliderData.length - 1 : prev - 1));
	const nextSlide = () =>
		setCurrent((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1));

	return (
		<main className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
			{/* Slider */}
			<section className="w-[90%] mx-auto rounded-3xl overflow-visible mb-0 relative shadow-2xl bg-white">
				<div
					className="relative flex items-center justify-center min-h-[400px] md:min-h-[500px] rounded-3xl"
					style={{ background: slide.bannerType === "snack" ? slide.bg : undefined }}
				>
					{slide.bannerType === "snack" ? (
						<>
							{/* Left food images */}
							<img
								src="https://th.bing.com/th/id/R.05718fd1f0d2e7c620784bf4a96f03d3?rik=bnqRjcTniogZRA&riu=http%3a%2f%2fwww.pngall.com%2fwp-content%2fuploads%2f2016%2f04%2fJuice-Free-PNG-Image.png&ehk=Q%2btnyaTIDsL6R118moutQUoQT85mB%2burPo6i5vIVLHo%3d&risl=1&pid=ImgRaw&r=0"
								alt="juice"
								className="absolute left-4 bottom-20 w-24 md:w-45 z-50"
							/>
							<img
								src="https://pngimg.com/d/orange_PNG807.png"
								alt="orange"
								className="absolute left-55 bottom-8 w-16 md:w-24 z-10"
							/>
							<img
								src="https://pngimg.com/d/cookie_PNG13646.png"
								alt="cookie"
								className="absolute left-80 bottom-37 w-20 md:w-28 z-10"
							/>
							{/* Right food images */}
							<img
								src="https://pngimg.com/d/bread_PNG2327.png"
								alt="bread"
								className="absolute right-7 bottom-8 w-40 md:w-56 z-10"
							/>
							<img
								src="https://static.vecteezy.com/system/resources/previews/024/108/124/original/fresh-cold-coffee-isolated-on-transparent-background-png.png"
								alt="cold drink"
								className="absolute right-53 bottom-10 w-12 md:w-60 z-10"
							/>
							<img
								src="https://pngimg.com/d/tomato_PNG12594.png"
								alt="tomato"
								className="absolute right-105 bottom-30 w-10 md:w-26 z-10"
							/>
							{/* Wavy white bottom - full width and height */}
							<svg
								className="absolute left-0 bottom-0 w-full h-full z-0"
								viewBox="0 -70 1440 320"
								preserveAspectRatio="none"
							>
								<path
									fill="#fff"
									fillOpacity="1"
									d="M0,224L60,197.3C120,171,240,117,360,117.3C480,117,600,171,720,197.3C840,224,960,224,1080,197.3C1200,171,1320,117,1380,90.7L1440,64L1440,320L0,320Z"
								></path>
							</svg>
							{/* Slider Buttons on top of banner */}
							<button
								onClick={prevSlide}
								aria-label="Previous Slide"
								className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-white/70 hover:bg-white text-blue-700 hover:text-blue-900 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg border border-blue-100 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
							>
								<svg
									width="28"
									height="28"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
							<button
								onClick={nextSlide}
								aria-label="Next Slide"
								className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-white/70 hover:bg-white text-blue-700 hover:text-blue-900 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg border border-blue-100 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
							>
								<svg
									width="28"
									height="28"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
							{/* Centered Content */}
								<div className="relative z-20 flex flex-col items-center justify-center text-center w-full px-2 md:px-0 pt-0 mt-[-102px]">								<div className="text-base font-bold text-white mb-4 tracking-wider uppercase drop-shadow-lg">
									{slide.subtitle}{" "}
									<span className="text-green-300">{slide.offer}</span>
								</div>
								<h2 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-4 leading-tight drop-shadow-lg">
									{slide.title}
								</h2>
								<div className="text-gray-700 mb-6 text-base md:text-lg font-medium drop-shadow-lg max-w-xl mx-auto">
									{slide.desc}
								</div>
								<a
									href={slide.btnUrl}
									className="inline-block px-8 py-3 bg-pink-500 text-white rounded-xl shadow-lg hover:bg-pink-600 transition font-bold text-lg md:text-xl"
									aria-label="Shop Now"
								>
									{slide.btn}
								</a>
							</div>
						</>
					) : (
						<>
							<div
								className="absolute inset-0 w-full h-full rounded-3xl bg-cover bg-center"
								style={{ backgroundImage: `url(${slide.img})` }}
								aria-hidden="true"
							/>
							<div className="absolute inset-0 bg-black/40 rounded-3xl pointer-events-none z-0" />
							<button
								onClick={prevSlide}
								aria-label="Previous Slide"
								className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/70 hover:bg-white text-blue-700 hover:text-blue-900 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg border border-blue-100 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
							>
								<svg
									width="28"
									height="28"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
							<button
								onClick={nextSlide}
								aria-label="Next Slide"
								className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/70 hover:bg-white text-blue-700 hover:text-blue-900 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg border border-blue-100 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
							>
								<svg
									width="28"
									height="28"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
							<div className="relative z-10 flex flex-col items-center justify-center text-center w-full px-4 md:px-0">
								<div className="text-base font-bold text-white mb-4 tracking-wider uppercase drop-shadow-lg">
									{slide.subtitle}{" "}
									<span className="text-green-300">{slide.offer}</span>
								</div>
								<h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl">
									{slide.title}
								</h2>
								<div className="text-white mb-6 text-2xl md:text-3xl font-medium drop-shadow-lg">
									{slide.desc}
								</div>
								<div className="text-4xl md:text-5xl font-extrabold text-pink-200 mb-10 drop-shadow-lg">
									{slide.price}
								</div>
								<a
									href={slide.btnUrl}
									className="inline-block px-10 py-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition font-bold text-2xl md:text-3xl"
									aria-label="Shop Now"
								>
									{slide.btn}
								</a>
							</div>
						</>
					)}
				</div>
			</section>
			{/* Categories */}
			<section className="w-[90%] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8 bg-gray-50 py-14 px-4 rounded-2xl">
				{categories.map((cat, idx) => (
					<div
						key={cat.name}
						className="flex flex-col items-center justify-center bg-gradient-to-br from-white via-gray-100 to-blue-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 cursor-pointer group border border-gray-100 hover:border-blue-300 transform hover:-translate-y-2"
						tabIndex={0}
						aria-label={cat.name}
					>
						<div className={`flex items-center justify-center rounded-full mb-4 transition-all duration-300 w-20 h-20 md:w-24 md:h-24 shadow-lg group-hover:scale-110 ${idx % 2 === 0 ? 'bg-gradient-to-br from-blue-100 to-blue-300' : 'bg-gradient-to-br from-pink-100 to-pink-300'}`}>
							<Image
								src={cat.icon}
								alt={cat.name}
								width={56}
								height={56}
								className="object-contain"
							/>
						</div>
						<span className="font-semibold text-lg md:text-xl text-gray-800 group-hover:text-blue-600 transition-colors duration-200 tracking-wide text-center">
							{cat.name}
						</span>
					</div>
				))}
			</section>

			{/* Popular Products */}
			<section className="w-[90%] mx-auto py-16">
				<div className="mb-8">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Popular Products</h2>
					<p className="text-gray-600 text-lg">Do not miss the current offers until the end of March.</p>
				</div>
				
				{/* Category Tabs */}
				<div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
					{["FASHION", "ELECTRONICS", "BAGS", "FOOTWEAR", "GROCERIES", "BEAUTY", "WELLNESS", "JEWELLERY"].map((tab, idx) => (
						<button
							key={tab}
							className={`px-4 py-2 font-medium text-sm md:text-base transition-colors duration-200 border-b-2 ${
								idx === 0 
									? "text-red-500 border-red-500" 
									: "text-gray-600 border-transparent hover:text-gray-800"
							}`}
						>
							{tab}
						</button>
					))}
				</div>

				{/* Products Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
					{popularProducts.map((product) => (
						<div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
							<div className="relative">
								<Image
									src={product.image}
									alt={product.name}
									width={300}
									height={300}
									className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
								/>
								<div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
									{product.discount}
								</div>
								{/* Hover Overlay with Icons */}
								<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
									<button 
										className="bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
										aria-label="Add to Wishlist"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
										</svg>
									</button>
									<button 
										className="bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100"
										aria-label="View Details"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									</button>
								</div>
							</div>
							<div className="p-4">
								<p className="text-sm text-gray-600 mb-1">{product.brand}</p>
								<h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
								<div className="flex items-center mb-2">
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center gap-2">
										<span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
										<span className="text-lg font-bold text-red-500">₹{product.salePrice}</span>
									</div>
								</div>
								<button className="w-full bg-white border-2 border-red-500 text-red-500 py-2 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5-1.5M7 13l-1.5 1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
									</svg>
									ADD TO CART
								</button>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Main Banner */}
			<section className="w-[90%] mx-auto mb-8">
				<div className="flex flex-col lg:flex-row gap-6">
					{/* Left Large Banner */}
					<div className="flex-1 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl overflow-hidden relative min-h-[400px]">
						<div className="absolute inset-0 flex items-center">
							<div className="w-1/2 p-8 z-10">
								<p className="text-sm text-gray-600 mb-2">Big saving days sale</p>
								<h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
									Buy New Trend Women Black Cotton Blend Top | top for women | women top...
								</h2>
								<div className="mb-6">
									<span className="text-sm text-gray-600">Starting At Only </span>
									<span className="text-3xl font-bold text-red-500">₹1,550.00</span>
								</div>
								<button className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors">
									SHOP NOW
								</button>
							</div>
							<div className="w-1/2 relative h-[300px] md:h-[400px] flex items-end">
								<Image
									src="https://png.pngtree.com/png-vector/20250325/ourmid/pngtree-beautiful-woman-with-black-dress-png-image_15860801.png"
									alt="Woman in yellow top"
									fill
									style={{ objectFit: "contain" }}
									className="absolute right-0 top-0"
								/>
							</div>
						</div>
					</div>

					{/* Right Side Banners */}
					<div className="flex flex-col gap-6 lg:w-80">
						{/* Footwear Banner */}
						<div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl p-6 relative overflow-hidden">
							<div className="relative z-10">
								<h3 className="text-xl font-bold text-gray-800 mb-2">Buy Men's Footwear</h3>
								<p className="text-gray-600 mb-2">with low price</p>
								<div className="text-2xl font-bold text-red-500 mb-3">₹1500</div>
								<button className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900 transition-colors underline">
									SHOP NOW
								</button>
							</div>
							<Image
								src="https://file.aiquickdraw.com/imgcompressed/img/compressed_f8769206cd169f1edea6929c085e5cc1.webp"
								alt="Men's footwear"
								width={150}
								height={150}
								className="absolute right-2 top-2 object-contain"
							/>
						</div>

						{/* Electronics Banner */}
						<div className="bg-gradient-to-r from-green-100 to-green-200 rounded-2xl p-6 relative overflow-hidden">
							<div className="relative z-10">
								<h3 className="text-xl font-bold text-gray-800 mb-2">Samsung S24 Ultra</h3>
								<div className="text-2xl font-bold text-red-500 mb-3">₹45000</div>
								<button className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900 transition-colors underline">
									SHOP NOW
								</button>
							</div>
							<Image 
								src="/samsung.png"
								alt="Samsung S24 Ultra"
								width={100}
								height={100}
								className="absolute right-2 top-2 object-contain"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Free Shipping Banner */}
			<section className="w-[90%] mx-auto mb-8">
				<div className="bg-white border-2 border-red-300 rounded-2xl p-6 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
							<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<div>
							<h3 className="text-xl font-bold text-gray-800">FREE SHIPPING</h3>
							<p className="text-gray-600">Free Delivery Now On Your First Order and over $200</p>
						</div>
					</div>
					<div className="text-right">
						<span className="text-2xl font-bold text-gray-800">- Only $200*</span>
					</div>
				</div>
			</section>
		</main>
	);
}
