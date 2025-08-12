"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Members will be fetched from the database via API
type MemberRow = {
	id: number;
	membershipId: string;
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
	const [selectedMember, setSelectedMember] = useState<any>(null);
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
		const matchesSearch =
			member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			member.membershipId.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

	const handleDeleteMember = (memberId: number) => {
		if (confirm("Are you sure you want to delete this member?")) {
			setMembers(members.filter((member) => member.id !== memberId));
		}
	};

	const handleEditMember = (member: any) => {
		setSelectedMember(member);
		setShowEditModal(true);
	};

	const handleSuspendMember = (memberId: number) => {
		setMembers(
			members.map((member) =>
				member.id === memberId
					? { ...member, status: member.status === "Suspended" ? "Active" : "Suspended" }
					: member
			)
		);
	};

	if (!isAuthenticated) {
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
							Members Management
						</h1>
						<p className="text-gray-600">
							Manage library member accounts and subscriptions
						</p>
					</div>
					<button
						onClick={() => setShowAddModal(true)}
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
						Add New Member
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
											d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
										/>
									</svg>
								</div>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-500">
									Total Members
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{members.length}
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
									Active Members
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{
										members.filter((m) => m.status === "Active")
											.length
									}
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
											d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-500">
									Suspended
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{
										members.filter((m) => m.status === "Suspended")
											.length
									}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
									<svg
										className="w-5 h-5 text-red-600"
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
									Expired
								</p>
								<p className="text-2xl font-bold text-gray-900">
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
				<div className="bg-white rounded-lg shadow p-6 mb-8">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="md:col-span-2">
							<label
								htmlFor="search"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Search Members
							</label>
							<input
								type="text"
								id="search"
								placeholder="Search by name, email, ID, or phone..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
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
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Membership Type
							</label>
							<select
								id="membershipType"
								value={selectedMembershipType}
								onChange={(e) => setSelectedMembershipType(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
					<div className="mt-4">
						<p className="text-sm text-gray-600">
							Showing {paginatedMembers.length} of{" "}
							{filteredMembers.length} members
						</p>
					</div>
				</div>

				{/* Members Table */}
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Member
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Contact
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Membership
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Books/Fines
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Last Activity
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{paginatedMembers.map((member) => (
									<tr key={member.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-10 w-10">
													<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
														<span className="text-sm font-medium text-blue-600">
															{member.name
																.split(" ")
																.map((n) => n[0])
																.join("")}
														</span>
													</div>
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900">
														{member.name}
													</div>
													<div className="text-sm text-gray-500">
														{member.membershipId}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{member.email}
											</div>
											<div className="text-sm text-gray-500">
												{member.phone}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{member.membershipType}
											</div>
											<div className="text-sm text-gray-500">
												Expires: {member.expiryDate}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
													member.status === "Active"
														? "bg-green-100 text-green-800"
														: member.status === "Suspended"
														? "bg-red-100 text-red-800"
														: "bg-gray-100 text-gray-800"
												}`}
											>
												{member.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											<div>Books: {member.booksIssued}</div>
											<div
												className={
													member.fineAmount > 0
														? "text-red-600"
														: "text-gray-500"
												}
											>
												Fine: ₹{member.fineAmount}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{member.lastActivity}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex space-x-2">
												<button
													onClick={() => handleEditMember(member)}
													className="text-blue-600 hover:text-blue-900 transition-colors"
												>
													Edit
												</button>
												<button
													onClick={() => handleSuspendMember(member.id)}
													className={`transition-colors ${
														member.status === "Suspended"
															? "text-green-600 hover:text-green-900"
															: "text-yellow-600 hover:text-yellow-900"
													}`}
												>
													{member.status === "Suspended"
														? "Activate"
														: "Suspend"}
												</button>
												<button
													onClick={() => handleDeleteMember(member.id)}
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
											{Math.min(startIndex + membersPerPage, filteredMembers.length)}
										</span>{" "}
										of{" "}
										<span className="font-medium">{filteredMembers.length}</span>{" "}
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

			{/* Add Member Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									Add New Member
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
							<form className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Full Name
										</label>
										<input
											type="text"
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Email
										</label>
										<input
											type="email"
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Phone
										</label>
										<input
											type="tel"
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Membership Type
										</label>
										<select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
											<option value="">Select Type</option>
											<option value="Student">Student</option>
											<option value="Standard">Standard</option>
											<option value="Premium">Premium</option>
										</select>
									</div>
									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Address
										</label>
										<textarea
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											rows={3}
										></textarea>
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
										Add Member
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
