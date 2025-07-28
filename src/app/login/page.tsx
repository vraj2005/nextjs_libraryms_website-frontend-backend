"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();
	const { login } = useAuth();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
		setError(""); // Clear error when user types
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		
		try {
			const result = await login(formData.email, formData.password);
			
			if (result.success) {
				// Check if user is admin and redirect accordingly
				if (result.user?.role === 'ADMIN') {
					// Set admin session for existing admin dashboard compatibility
					localStorage.setItem("adminAuth", "true");
					localStorage.setItem("adminUser", JSON.stringify({
						username: result.user.username ,
						email: result.user.email,
						role: "Administrator",
						loginTime: new Date().toISOString()
					}));
					router.push('/admin/dashboard');
				} else {
					// Regular user redirect to home
					router.push('/');
				}
			} else {
				setError(result.error || 'Login failed');
			}
		} catch (error) {
			setError('An error occurred during login');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-5">
				<svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
					<defs>
						<pattern id="library-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
							<rect width="20" height="20" fill="none"/>
							<text x="2" y="10" fontSize="8" fill="currentColor">📚</text>
							<text x="12" y="15" fontSize="6" fill="currentColor">📖</text>
						</pattern>
					</defs>
					<rect width="100" height="100" fill="url(#library-pattern)"/>
				</svg>
			</div>

			<div className="relative w-full max-w-md">
				{/* Main Login Card */}
				<div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
					{/* Header Section */}
					<div className="relative bg-gradient-to-r from-sky-600 to-indigo-600 p-8 text-center">
						{/* Decorative Elements */}
						<div className="absolute top-4 left-4 text-2xl opacity-30 animate-pulse">📚</div>
						<div className="absolute top-4 right-4 text-xl opacity-20 animate-bounce">🎓</div>
						<div className="absolute bottom-4 left-6 text-lg opacity-25">📖</div>
						
						<div className="relative z-10">
							<div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
								<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
								</svg>
							</div>
							<h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
							<p className="text-sky-100 text-sm">Sign in to access your library account</p>
						</div>
					</div>

					{/* Login Form */}
					<div className="p-8">
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Email Field */}
							<div>
								<label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
									Email Address
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
										</svg>
									</div>
									<input
										type="email"
										id="email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
										placeholder="Enter your email"
										required
									/>
								</div>
							</div>

							{/* Password Field */}
							<div>
								<label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
									Password
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
									</div>
									<input
										type={showPassword ? "text" : "password"}
										id="password"
										name="password"
										value={formData.password}
										onChange={handleInputChange}
										className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
										placeholder="Enter your password"
										required
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<svg className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
											</svg>
										) : (
											<svg className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
											</svg>
										)}
									</button>
								</div>
							</div>

							{/* Error Message */}
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
									<div className="flex items-center gap-2">
										<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<span className="text-sm font-medium">{error}</span>
									</div>
								</div>
							)}

							{/* Admin Login Info
							<div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl">
								<div className="flex items-start gap-2">
									<svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<div>
										<p className="text-sm font-semibold mb-1">Admin Access</p>
										<p className="text-xs font-medium">Use "admin" for both email and password to access admin dashboard</p>
									</div>
								</div>
							</div> */}

							{/* Remember Me & Forgot Password */}
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<input
										id="rememberMe"
										name="rememberMe"
										type="checkbox"
										checked={formData.rememberMe}
										onChange={handleInputChange}
										className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
									/>
									<label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-800 font-medium">
										Remember me
									</label>
								</div>
								<Link
									href="/forgot-password"
									className="text-sm text-sky-600 hover:text-sky-800 font-semibold transition-colors"
								>
									Forgot password?
								</Link>
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								disabled={isLoading}
								className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-sky-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
							>
								{isLoading ? (
									<div className="flex items-center justify-center">
										<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Signing in...
									</div>
								) : (
									"Sign In"
								)}
							</button>
						</form>

						{/* Divider */}
						<div className="mt-8 mb-6">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-4 bg-white text-gray-500">or continue with</span>
								</div>
							</div>
						</div>

						{/* Social Login Options */}
						<div className="grid grid-cols-2 gap-3">
							<button
								type="button"
								className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors"
							>
								<svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24">
									<path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
									<path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
									<path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
									<path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
								</svg>
								<span className="ml-2 text-sm font-semibold text-gray-800">Google</span>
							</button>
							<button
								type="button"
								className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors"
							>
								<svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.719-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.747 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
								</svg>
								<span className="ml-2 text-sm font-semibold text-gray-800">GitHub</span>
							</button>
						</div>

						{/* Sign Up Link */}
						<div className="mt-8 text-center">
							<p className="text-sm text-gray-700">
								Don't have an account?{" "}
								<Link
									href="/register"
									className="font-bold text-sky-600 hover:text-sky-800 transition-colors"
								>
									Sign up here
								</Link>
							</p>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-6 text-center">
					<p className="text-sm text-gray-700 font-medium">
						© 2025 LibraryMS. Secure access to knowledge.
					</p>
				</div>
			</div>
		</div>
	);
}
