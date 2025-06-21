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
		</main>
	);
}
