"use client";

import { useState } from "react";
import Link from "next/link";
import { generateLetterAvatar, validateImageFile } from "@/lib/avatar-utils";

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
		username: "",
		phone: "",
		address: "",
		agreeToTerms: false,
		subscribeNewsletter: false,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState(0);
	const [profileImage, setProfileImage] = useState<string | null>(null);
	const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

	// Get display avatar (uploaded image or letter avatar)
	const getDisplayAvatar = () => {
		if (profileImage) {
			return profileImage;
		}
		if (formData.firstName && formData.lastName) {
			return generateLetterAvatar(formData.firstName, formData.lastName, 80);
		}
		return null;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;
		
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));

		// Calculate password strength
		if (name === "password") {
			setPasswordStrength(calculatePasswordStrength(value));
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate image file
			const validation = validateImageFile(file);
			if (!validation.valid) {
				alert(validation.error);
				return;
			}

			setProfileImageFile(file);

			// Create preview
			const reader = new FileReader();
			reader.onload = () => {
				setProfileImage(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setProfileImage(null);
		setProfileImageFile(null);
		// Reset file input
		const fileInput = document.getElementById('profileImage') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
	};

	const calculatePasswordStrength = (password: string) => {
		let strength = 0;
		if (password.length >= 8) strength += 1;
		if (/[a-z]/.test(password)) strength += 1;
		if (/[A-Z]/.test(password)) strength += 1;
		if (/[0-9]/.test(password)) strength += 1;
		if (/[^A-Za-z0-9]/.test(password)) strength += 1;
		return strength;
	};

	const getPasswordStrengthColor = () => {
		switch (passwordStrength) {
			case 0:
			case 1: return "bg-red-500";
			case 2: return "bg-orange-500";
			case 3: return "bg-yellow-500";
			case 4: return "bg-lime-500";
			case 5: return "bg-green-500";
			default: return "bg-gray-300";
		}
	};

	const getPasswordStrengthText = () => {
		switch (passwordStrength) {
			case 0:
			case 1: return "Weak";
			case 2: return "Fair";
			case 3: return "Good";
			case 4: return "Strong";
			case 5: return "Very Strong";
			default: return "";
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (formData.password !== formData.confirmPassword) {
			alert("Passwords don't match!");
			return;
		}

		if (!formData.agreeToTerms) {
			alert("Please agree to the terms and conditions!");
			return;
		}

		if (!formData.subscribeNewsletter) {
			alert("Please subscribe to newsletter to receive updates about new books and library events!");
			return;
		}

		if (!formData.username.trim()) {
			alert("Username is required!");
			return;
		}

		setIsLoading(true);
		
		try {
			// Generate letter avatar if no profile image uploaded
			const finalProfileImage = profileImage || (formData.firstName && formData.lastName 
				? generateLetterAvatar(formData.firstName, formData.lastName, 80) 
				: null);

			// Prepare registration data
			const registrationData = {
				email: formData.email,
				password: formData.password,
				firstName: formData.firstName,
				lastName: formData.lastName,
				username: formData.username,
				phone: formData.phone || undefined,
				address: formData.address || undefined,
				profileImage: finalProfileImage || undefined
			};

			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(registrationData)
			});

			const data = await response.json();

			if (response.ok) {
				// Store token and user data
				localStorage.setItem('auth_token', data.token);
				localStorage.setItem('user_data', JSON.stringify(data.user));
				
				alert('Registration successful! Redirecting to home...');
				window.location.href = '/';
			} else {
				alert(data.error || 'Registration failed. Please try again.');
			}
		} catch (error) {
			console.error('Registration error:', error);
			alert('Registration failed. Please check your internet connection and try again.');
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

			<div className="relative w-full max-w-2xl">
				{/* Main Registration Card */}
				<div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
					{/* Header Section */}
					<div className="relative bg-gradient-to-r from-sky-600 to-indigo-600 p-8 text-center">
						{/* Decorative Elements */}
						<div className="absolute top-4 left-4 text-2xl opacity-30 animate-pulse">📚</div>
						<div className="absolute top-4 right-4 text-xl opacity-20 animate-bounce">🎓</div>
						<div className="absolute bottom-4 left-6 text-lg opacity-25">📖</div>
						<div className="absolute bottom-4 right-6 text-lg opacity-25">✨</div>
						
						<div className="relative z-10">
							<div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
								<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</div>
							<h1 className="text-2xl font-bold text-white mb-2">Join Our Library</h1>
							<p className="text-sky-100 text-sm">Create your account and start exploring knowledge</p>
						</div>
					</div>

					{/* Registration Form */}
					<div className="p-8">
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Profile Image Upload */}
							<div>
								<label className="block text-sm font-semibold text-gray-800 mb-3">
									Profile Picture (Optional)
								</label>
								<div className="flex items-center space-x-4">
									<div className="flex-shrink-0">
										{getDisplayAvatar() ? (
											<div className="relative">
												<img
													src={getDisplayAvatar()!}
													alt="Profile preview"
													className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
												/>
												{profileImage && (
													<button
														type="button"
														onClick={removeImage}
														className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
													>
														×
													</button>
												)}
											</div>
										) : (
											<div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
												<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
											</div>
										)}
									</div>
									<div className="flex-1">
										<input
											type="file"
											id="profileImage"
											accept="image/*"
											onChange={handleImageChange}
											className="hidden"
										/>
										<label
											htmlFor="profileImage"
											className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
										>
											<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
											</svg>
											{profileImage ? 'Change Image' : 'Choose Image'}
										</label>
										<p className="text-xs text-gray-500 mt-1">
											{formData.firstName && formData.lastName && !profileImage 
												? "Letter avatar will be generated if no image is selected" 
												: "Max size: 5MB. Formats: JPG, PNG, GIF"}
										</p>
									</div>
								</div>
							</div>

							{/* Name Fields */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="firstName" className="block text-sm font-semibold text-gray-800 mb-2">
										First Name
									</label>
									<input
										type="text"
										id="firstName"
										name="firstName"
										value={formData.firstName}
										onChange={handleInputChange}
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
										placeholder="Enter your first name"
										required
									/>
								</div>
								<div>
									<label htmlFor="lastName" className="block text-sm font-semibold text-gray-800 mb-2">
										Last Name
									</label>
									<input
										type="text"
										id="lastName"
										name="lastName"
										value={formData.lastName}
										onChange={handleInputChange}
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
										placeholder="Enter your last name"
										required
									/>
								</div>
							</div>

							{/* Email Field */}
							<div>
								<label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
									Email Address
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

							{/* Contact Information */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
										Phone Number (Optional)
									</label>
									<input
										type="tel"
										id="phone"
										name="phone"
										value={formData.phone}
										onChange={handleInputChange}
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
										placeholder="Enter your phone number"
									/>
								</div>
								<div>
									<label htmlFor="username" className="block text-sm font-semibold text-gray-800 mb-2">
										Username
									</label>
									<input
										type="text"
										id="username"
										name="username"
										value={formData.username}
										onChange={handleInputChange}
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
										placeholder="Choose a username"
										required
									/>
								</div>
							</div>

							{/* Address Field */}
							<div>
								<label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-2">
									Address (Optional)
								</label>
								<textarea
									id="address"
									name="address"
									value={formData.address}
									onChange={handleInputChange}
									rows={3}
									className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 resize-none"
									placeholder="Enter your address"
								/>
							</div>

							{/* Password Fields */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
										Password
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
											placeholder="Create a password"
											required
										/>
										<button
											type="button"
											className="absolute inset-y-0 right-0 pr-3 flex items-center"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? (
												<svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
												</svg>
											) : (
												<svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												</svg>
											)}
										</button>
									</div>
									{/* Password Strength Indicator */}
									{formData.password && (
										<div className="mt-2">
											<div className="flex items-center space-x-2">
												<div className="flex space-x-1 flex-1">
													{[...Array(5)].map((_, i) => (
														<div
															key={i}
															className={`h-1 rounded-full transition-all duration-300 ${
																i < passwordStrength ? getPasswordStrengthColor() : "bg-gray-200"
															}`}
															style={{ flex: 1 }}
														/>
													))}
												</div>
												<span className="text-xs font-medium text-gray-700">
													{getPasswordStrengthText()}
												</span>
											</div>
										</div>
									)}
								</div>
								<div>
									<label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
										Confirm Password
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<input
											type={showConfirmPassword ? "text" : "password"}
											id="confirmPassword"
											name="confirmPassword"
											value={formData.confirmPassword}
											onChange={handleInputChange}
											className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
											placeholder="Confirm your password"
											required
										/>
										<button
											type="button"
											className="absolute inset-y-0 right-0 pr-3 flex items-center"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										>
											{showConfirmPassword ? (
												<svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
												</svg>
											) : (
												<svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												</svg>
											)}
										</button>
									</div>
									{/* Password Match Indicator */}
									{formData.confirmPassword && (
										<div className="mt-2">
											{formData.password === formData.confirmPassword ? (
												<div className="flex items-center text-green-600 text-xs">
													<svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
													</svg>
													Passwords match
												</div>
											) : (
												<div className="flex items-center text-red-600 text-xs">
													<svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
													</svg>
													Passwords do not match
												</div>
											)}
										</div>
									)}
								</div>
							</div>

							{/* Checkboxes */}
							<div className="space-y-4">
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="agreeToTerms"
											name="agreeToTerms"
											type="checkbox"
											checked={formData.agreeToTerms}
											onChange={handleInputChange}
											className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
											required
										/>
									</div>
									<div className="ml-3 text-sm">
										<label htmlFor="agreeToTerms" className="text-gray-800">
											I agree to the{" "}
											<Link href="/terms" className="text-sky-600 hover:text-sky-800 font-medium">
												Terms and Conditions
											</Link>{" "}
											and{" "}
											<Link href="/privacy" className="text-sky-600 hover:text-sky-800 font-medium">
												Privacy Policy
											</Link>
										</label>
									</div>
								</div>
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="subscribeNewsletter"
											name="subscribeNewsletter"
											type="checkbox"
											checked={formData.subscribeNewsletter}
											onChange={handleInputChange}
											className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
											required
										/>
									</div>
									<div className="ml-3 text-sm">
										<label htmlFor="subscribeNewsletter" className="text-gray-800">
											<span className="text-red-500">*</span> I want to receive updates about new books and library events
											<span className="block text-xs text-gray-500 mt-1">(Required to complete registration)</span>
										</label>
									</div>
								</div>
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								disabled={isLoading || !formData.agreeToTerms || !formData.subscribeNewsletter}
								className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-sky-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
							>
								{isLoading ? (
									<div className="flex items-center justify-center">
										<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Creating account...
									</div>
								) : (
									"Create Account"
								)}
							</button>
						</form>

						{/* Sign In Link */}
						<div className="mt-8 text-center">
							<p className="text-sm text-gray-700">
								Already have an account?{" "}
								<Link
									href="/login"
									className="font-semibold text-sky-600 hover:text-sky-800 transition-colors"
								>
									Sign in here
								</Link>
							</p>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-6 text-center">
					<p className="text-xs text-gray-500">
						© 2025 LibraryMS. Empowering knowledge for everyone.
					</p>
				</div>
			</div>
		</div>
	);
}
