"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Members will be fetched from the database via API
type MemberRow = {
	userId: string;
	id: number;
	membershipId: string;
	username?: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	membershipType: string;
	status: 'Active' | 'Suspended' | 'Expired' | string;
	joinDate: string;
	expiryDate: string;
	booksIssued: number;
	fineAmount: number;
	lastActivity: string;
}

export default function AdminMembers() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [members, setMembers] = useState<MemberRow[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [selectedMembershipType, setSelectedMembershipType] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
		const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
		const [suspendLoadingId, setSuspendLoadingId] = useState<string | null>(null);
		const [editForm, setEditForm] = useState({
			username: '',
			fullName: '',
			email: '',
			phone: '',
			address: '',
			status: 'Active',
		});
	const router = useRouter();

	const membersPerPage = 10;
	const membershipTypes = [
		...new Set(members.map((member) => member.membershipType)),
	];

	// Authentication check
	useEffect(() => {
		const adminAuth = localStorage.getItem("adminAuth");
		if (!adminAuth || adminAuth !== "true") {
			router.push("/admin/login");
			return;
		}
		setIsAuthenticated(true);

		// Load members from API without altering the UI design
		const loadMembers = async () => {
			try {
				const token = localStorage.getItem('auth_token') || '';
				const resp = await fetch('/api/admin/users', {
					headers: { 'Authorization': `Bearer ${token}` },
					cache: 'no-store'
				});
				if (resp.ok) {
					const data = await resp.json();
					setMembers(Array.isArray(data.users) ? data.users : []);
				} else {
					setMembers([]);
				}
			} catch {
				setMembers([]);
			}
		};
		void loadMembers();
	}, [router]);

	// Filter and search members
	const filteredMembers = members.filter((member) => {
			const q = searchQuery.toLowerCase();
			const matchesSearch =
				member.name.toLowerCase().includes(q) ||
				member.email.toLowerCase().includes(q) ||
				(member.username ? member.username.toLowerCase().includes(q) : false) ||
				member.membershipId.toLowerCase().includes(q) ||
				member.phone.includes(searchQuery);

		const matchesStatus =
			selectedStatus === "all" || member.status === selectedStatus;
		const matchesMembershipType =
			selectedMembershipType === "all" ||
			member.membershipType === selectedMembershipType;

		return matchesSearch && matchesStatus && matchesMembershipType;
	});

	// Pagination
	const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
	const startIndex = (currentPage - 1) * membersPerPage;
	const paginatedMembers = filteredMembers.slice(
		startIndex,
		startIndex + membersPerPage
	);

	const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

	const handleDeleteMember = async (member: MemberRow) => {
		if (!confirm('Are you sure you want to delete this member? This cannot be undone.')) return;
		try {
			setDeleteLoadingId(member.userId);
			const token = localStorage.getItem('auth_token') || '';
			const resp = await fetch(`/api/admin/users/${encodeURIComponent(member.userId)}`, {
				method: 'DELETE',
				headers: { 'Authorization': `Bearer ${token}` },
				cache: 'no-store'
			});
			if (!resp.ok) {
				const data = await resp.json().catch(() => ({}));
				alert(data.error || 'Failed to delete member');
				return;
			}
			setMembers(prev => prev.filter(m => m.userId !== member.userId));
		} catch (e) {
			console.error('Delete member failed', e);
			alert('Failed to delete member');
		} finally {
			setDeleteLoadingId(null);
		}
	};

	const handleEditMember = (member: any) => {
			setSelectedMember(member);
			setEditForm({
		username: (member.username as string) || '',
				fullName: member.name || '',
				email: member.email || '',
				phone: member.phone || '',
				address: member.address || '',
				status: member.status || 'Active',
			});
			setShowEditModal(true);
	};

		const saveEditMember = async (e: React.FormEvent) => {
			e.preventDefault();
			if (!selectedMember) return;
			try {
				const token = localStorage.getItem('auth_token') || '';
				const [firstName, ...rest] = editForm.fullName.trim().split(' ');
				const lastName = rest.join(' ');
				const body = {
				username: editForm.username || undefined,
					firstName,
					lastName,
					email: editForm.email,
					phone: editForm.phone,
					address: editForm.address,
					isActive: editForm.status === 'Active',
				};
				const resp = await fetch(`/api/admin/users/${encodeURIComponent(selectedMember.userId)}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					cache: 'no-store',
					body: JSON.stringify(body)
				});
				const data = await resp.json();
				if (!resp.ok) {
					alert(data.error || 'Failed to update member');
					return;
				}
				// Update local list to reflect changes without reloading
				setMembers(prev => prev.map(m => m.userId === selectedMember.userId ? {
					...m,
				username: editForm.username,
					name: editForm.fullName,
					email: editForm.email,
					phone: editForm.phone,
					address: editForm.address,
					status: editForm.status,
				} : m));
				setShowEditModal(false);
				setSelectedMember(null);
			} catch (err) {
				console.error('Edit member failed', err);
				alert('Failed to update member');
			}
		};

	const handleSuspendMember = async (member: MemberRow) => {
		try {
			setSuspendLoadingId(member.userId);
			const token = localStorage.getItem('auth_token') || '';
			const newStatus = member.status === 'Suspended' ? 'Active' : 'Suspended';
			const resp = await fetch(`/api/admin/users/${encodeURIComponent(member.userId)}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				cache: 'no-store',
				body: JSON.stringify({ isActive: newStatus === 'Active' })
			});
			if (!resp.ok) {
				const data = await resp.json().catch(() => ({}));
				alert(data.error || 'Failed to update status');
				return;
			}
			setMembers(prev => prev.map(m => m.userId === member.userId ? { ...m, status: newStatus } : m));
		} catch (e) {
			console.error('Suspend/Activate failed', e);
			alert('Failed to update status');
		} finally {
			setSuspendLoadingId(null);
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
							</div>
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
									Members Management
								</h1>
								<p className="text-gray-600">
									Manage library member accounts and subscriptions
								</p>
							</div>
						</div>
						<button
							onClick={() => setShowAddModal(true)}
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
							Add New Member
						</button>
					</div>
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
											d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
										/>
									</svg>
								</div>
							</div>
							<div className="ml-5">
								<p className="text-sm font-medium text-gray-600">
									Total Members
								</p>
								<p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
									{members.length}
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
									Active Members
								</p>
								<p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
									{
										members.filter((m) => m.status === "Active")
											.length
									}
								</p>
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
											d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
							</div>
							<div className="ml-5">
								<p className="text-sm font-medium text-gray-600">
									Suspended
								</p>
								<p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
									{
										members.filter((m) => m.status === "Suspended")
											.length
									}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
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
									Expired
								</p>
								<p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
									{
										members.filter((m) => m.status === "Expired")
											.length
									}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Search and Filters */}
				<div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8 mb-8">
					<h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
						<svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						Search & Filters
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						<div className="md:col-span-2">
							<label
								htmlFor="search"
								className="block text-sm font-semibold text-gray-700 mb-3"
							>
								Search Members
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
								</div>
								<input
									type="text"
									id="search"
									placeholder="Search by name, email, ID, or phone..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 hover:bg-white/70"
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor="status"
								className="block text-sm font-semibold text-gray-700 mb-3"
							>
								Status
							</label>
							<select
								id="status"
								value={selectedStatus}
								onChange={(e) => setSelectedStatus(e.target.value)}
								className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 hover:bg-white/70"
							>
								<option value="all">All Status</option>
								<option value="Active">Active</option>
								<option value="Suspended">Suspended</option>
								<option value="Expired">Expired</option>
							</select>
						</div>
						<div>
							<label
								htmlFor="membershipType"
								className="block text-sm font-semibold text-gray-700 mb-3"
							>
								Membership Type
							</label>
							<select
								id="membershipType"
								value={selectedMembershipType}
								onChange={(e) => setSelectedMembershipType(e.target.value)}
								className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 hover:bg-white/70"
							>
								<option value="all">All Types</option>
								{membershipTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="mt-6 pt-4 border-t border-gray-200/50">
						<p className="text-sm text-gray-600 flex items-center">
							<svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
							Showing&nbsp;<span className="font-semibold text-blue-600">{paginatedMembers.length}</span>&nbsp;of{" "}
							<span className="font-semibold text-gray-700">&nbsp;{filteredMembers.length}&nbsp;</span>members
						</p>
					</div>
				</div>

				{/* Members Table */}
				<div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm">
								<tr>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
										Member
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
										Username
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
										Email
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
										Contact Number
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
										Status
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
										Books/Fines
									</th>
									<th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white/30 backdrop-blur-sm">
								{paginatedMembers.map((member, index) => (
									<tr key={member.id} className="hover:bg-white/40 transition-all duration-200 border-b border-gray-200/30">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-11 w-11">
													<div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
														<span className="text-sm font-bold text-white">
															{member.name
																.split(" ")
																.map((n) => n[0])
																.join("")}
														</span>
													</div>
												</div>
												<div className="ml-4">
													<div className="text-sm font-semibold text-gray-900">
														{member.name}
													</div>
													<div className="text-xs text-gray-500">
														ID: {member.id}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{member.username || '-'}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{member.email}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{member.phone || '-'}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
													member.status === "Active"
														? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
														: member.status === "Suspended"
														? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
														: "bg-gradient-to-r from-red-500 to-red-600 text-white"
												}`}
											>
												{member.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<div className="space-y-1">
												<div className="flex items-center text-gray-900">
													<svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
													</svg>
													<span className="font-medium">{member.booksIssued}</span>
													<svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
													</svg>
													<span className="font-medium">₹{member.fineAmount}</span>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex space-x-2">
												<button
													onClick={() => handleEditMember(member)}
													className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 transition-all duration-200 hover:scale-105"
												>
													<svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
													Edit
												</button>
												<button
													onClick={() => handleSuspendMember(member)}
													disabled={suspendLoadingId === member.userId}
													className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
														member.status === "Suspended"
															? "text-green-700 bg-green-100 hover:bg-green-200"
															: "text-amber-700 bg-amber-100 hover:bg-amber-200"
													} ${suspendLoadingId === member.userId ? 'opacity-50 cursor-not-allowed' : ''}`}
												>
													{suspendLoadingId === member.userId ? (
														<svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
															<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
															<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
														</svg>
													) : member.status === "Suspended" ? (
														<svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
														</svg>
													) : (
														<svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
														</svg>
													)}
													{suspendLoadingId === member.userId ? 'Saving...' : (member.status === "Suspended" ? "Activate" : "Suspend")}
												</button>
												<button
													onClick={() => handleDeleteMember(member)}
													disabled={deleteLoadingId === member.userId}
													className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 transition-all duration-200 hover:scale-105 ${deleteLoadingId === member.userId ? 'opacity-50 cursor-not-allowed' : ''}`}
												>
													{deleteLoadingId === member.userId ? (
														<svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
															<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
															<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
														</svg>
													) : (
														<svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
														</svg>
													)}
													{deleteLoadingId === member.userId ? 'Deleting...' : 'Delete'}
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Smart Pagination */}
					{totalPages > 1 && (
						<div className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between border-t border-gray-200/50">
							<div className="flex-1 flex justify-between sm:hidden">
								<button
									onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
									disabled={currentPage === 1}
									className="relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white/70 hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
									</svg>
									Previous
								</button>
								<button
									onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
									disabled={currentPage === totalPages}
									className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white/70 hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Next
									<svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</div>
							<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
								<div>
									<p className="text-sm text-gray-700 flex items-center">
										<svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
										</svg>
										Showing{" "}
										<span className="font-semibold text-blue-600 mx-1">{startIndex + 1}</span> to{" "}
										<span className="font-semibold text-blue-600 mx-1">
											{Math.min(startIndex + membersPerPage, filteredMembers.length)}
										</span>{" "}
										of{" "}
										<span className="font-semibold text-gray-800 mx-1">{filteredMembers.length}</span>{" "}
										results
									</p>
								</div>
								<div>
									<nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px bg-white/70 backdrop-blur-sm">
										<button
											onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
											disabled={currentPage === 1}
											className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
											</svg>
											<span className="ml-1 hidden sm:inline">Previous</span>
										</button>
										{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
											<button
												key={page}
												onClick={() => setCurrentPage(page)}
												className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
													currentPage === page
														? "z-10 bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 text-white shadow-lg"
														: "bg-white/50 border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-md"
												}`}
											>
												{page}
											</button>
										))}
										<button
											onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
											disabled={currentPage === totalPages}
											className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<span className="mr-1 hidden sm:inline">Next</span>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
											</svg>
										</button>
									</nav>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Professional Add Member Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
					<div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
						<div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
							<div className="flex justify-between items-center">
								<div className="flex items-center">
									<div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
										<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
										</svg>
									</div>
									<div>
										<h3 className="text-xl font-bold">Add New Member</h3>
										<p className="text-blue-100 text-sm">Create a new library member account</p>
									</div>
								</div>
								<button
									onClick={() => setShowAddModal(false)}
									className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>
						<div className="p-6">
							<form className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-3">
											Full Name
										</label>
										<input
											type="text"
											className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 hover:bg-white/90"
											placeholder="Enter full name"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-3">
											Email Address
										</label>
										<input
											type="email"
											className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 hover:bg-white/90"
											placeholder="Enter email address"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-3">
											Phone Number
										</label>
										<input
											type="tel"
											className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 hover:bg-white/90"
											placeholder="Enter phone number"
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-3">
											Membership Type
										</label>
										<select className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 hover:bg-white/90">
											<option value="">Select membership type</option>
											<option value="Student">Student</option>
											<option value="Standard">Standard</option>
											<option value="Premium">Premium</option>
										</select>
									</div>
								<div className="md:col-span-2">
									<label className="block text-sm font-semibold text-gray-700 mb-3">
										Address
									</label>
									<textarea
										className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 hover:bg-white/90 resize-none"
										rows={3}
										placeholder="Enter complete address"
									></textarea>
								</div>
							</div>
						</form>
					</div>
					<div className="bg-gray-50/50 backdrop-blur-sm px-6 py-4 rounded-b-2xl border-t border-gray-200/50">
						<div className="flex justify-end space-x-3">
							<button
								type="button"
								onClick={() => setShowAddModal(false)}
								className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium bg-white hover:bg-gray-50 transition-all duration-200 hover:scale-105"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105 shadow-lg"
							>
								<svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
								</svg>
								Add Member
							</button>
						</div>
					</div>
				</div>
			</div>
		)}					{/* Edit Member Modal */}
					{showEditModal && selectedMember && (
						<div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
							<div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden"
								onClick={(e) => e.stopPropagation()}>
								<div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
									<div className="flex justify-between items-center">
										<h3 className="text-xl font-bold text-white">Edit Member</h3>
										<button onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white transition-colors">
											<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								</div>
								<div className="p-6 bg-gradient-to-br from-gray-50/50 to-white/80 backdrop-blur-sm">
									<form className="space-y-4" onSubmit={saveEditMember}>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															<div>
																<label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
																<input
																	type="text"
																	value={editForm.username}
																	onChange={(e) => setEditForm(f => ({ ...f, username: e.target.value }))}
																	className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
																/>
															</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
												<input
													type="text"
													value={editForm.fullName}
													onChange={(e) => setEditForm(f => ({ ...f, fullName: e.target.value }))}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
													required
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
												<input
													type="email"
													value={editForm.email}
													onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
													required
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
												<input
													type="tel"
													value={editForm.phone}
													onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>
											<div className="md:col-span-2">
												<label className="block text-sm font-semibold text-gray-700 mb-3">Address</label>
												<textarea
													rows={3}
													value={editForm.address}
													onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))}
													className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 hover:bg-white/90 resize-none"
													placeholder="Enter complete address"
												/>
											</div>
											<div className="md:col-span-2">
												<label className="block text-sm font-semibold text-gray-700 mb-3">Member Status</label>
												<div className="flex items-center gap-6">
													<label className="inline-flex items-center cursor-pointer group">
														<input 
															type="radio" 
															name="status" 
															checked={editForm.status === 'Active'} 
															onChange={() => setEditForm(f => ({ ...f, status: 'Active' }))}
															className="w-4 h-4 text-emerald-600 bg-white border-gray-300 focus:ring-emerald-500 focus:ring-2"
														/>
														<span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
															<span className="flex items-center">
																<span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
																Active
															</span>
														</span>
													</label>
													<label className="inline-flex items-center cursor-pointer group">
														<input 
															type="radio" 
															name="status" 
															checked={editForm.status === 'Suspended'} 
															onChange={() => setEditForm(f => ({ ...f, status: 'Suspended' }))}
															className="w-4 h-4 text-amber-600 bg-white border-gray-300 focus:ring-amber-500 focus:ring-2"
														/>
														<span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors">
															<span className="flex items-center">
																<span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
																Suspended
															</span>
														</span>
													</label>
												</div>
											</div>
										</div>
									</form>
								</div>
								<div className="bg-gray-50/50 backdrop-blur-sm px-6 py-4 rounded-b-2xl border-t border-gray-200/50">
									<div className="flex justify-end space-x-3">
										<button 
											type="button" 
											onClick={() => setShowEditModal(false)} 
											className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium bg-white hover:bg-gray-50 transition-all duration-200 hover:scale-105"
										>
											Cancel
										</button>
										<button 
											type="submit" 
											onClick={saveEditMember}
											className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 hover:scale-105 shadow-lg"
										>
											<svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
											</svg>
											Save Changes
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
		</div>
	);
}
