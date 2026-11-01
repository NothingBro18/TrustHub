import { useState, useEffect, useCallback } from 'react';
import {
  Users, UserCheck, Shield, Briefcase, Search, Filter,
  RefreshCw, Edit2, Trash2, CheckCircle2,
  XCircle, ChevronLeft, ChevronRight, Phone, MapPin,
  Calendar, AlertCircle, X,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { adminService } from '../../services';
import { ADMIN_NAV } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

/* ── Fallback mock users if DB fetch fails ── */
const MOCK_USERS = [
  {
    _id: 'u1',
    name: 'Admin Sujal',
    email: 'admin@trusthub.com',
    role: 'admin',
    isVerified: true,
    phone: '+91 9980046013',
    location: { city: 'Belagavi', state: 'Karnataka' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'u2',
    name: 'Rahul Patil',
    email: 'customer@trusthub.com',
    role: 'customer',
    isVerified: true,
    phone: '+91 97777 23456',
    location: { city: 'Belagavi', state: 'Karnataka' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'u3',
    name: 'Arun Sharma',
    email: 'provider@trusthub.com',
    role: 'provider',
    isVerified: true,
    phone: '+91 96666 34567',
    location: { city: 'Belagavi', state: 'Karnataka' },
    createdAt: new Date().toISOString(),
  },
];

const ROLE_BADGES = {
  customer: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Customer',
  },
  provider: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    label: 'Provider',
  },
  admin: {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    label: 'Admin',
  },
};

const AdminUsers = () => {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedVerified, setSelectedVerified] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals & Active state
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    isVerified: false,
  });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
      };
      if (selectedRole !== 'all') params.role = selectedRole;
      if (selectedVerified !== 'all') params.isVerified = selectedVerified;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await adminService.getAllUsers(params);
      if (res.data && res.data.users) {
        setUsers(res.data.users);
        setTotalUsers(res.data.total);
      }
    } catch {
      toast.error('Failed to load users from database. Showing local cache.');
      setUsers(MOCK_USERS);
      setTotalUsers(MOCK_USERS.length);
    } finally {
      setLoading(false);
    }
  }, [page, selectedRole, selectedVerified, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Search submit or clear
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setSelectedVerified('all');
    setPage(1);
  };

  // Toggle Verification
  const handleToggleVerification = async (user) => {
    const updatedStatus = !user.isVerified;
    try {
      await adminService.updateUser(user._id, { isVerified: updatedStatus });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isVerified: updatedStatus } : u))
      );
      toast.success(
        `${user.name} is now ${updatedStatus ? 'verified' : 'unverified'}`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update verification status');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      isVerified: Boolean(user.isVerified),
    });
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsUpdating(true);
    try {
      const res = await adminService.updateUser(editingUser._id, editFormData);
      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? { ...u, ...res.data.user } : u))
      );
      toast.success('User updated successfully');
      setEditingUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm Delete
  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setIsUpdating(true);
    try {
      await adminService.deleteUser(deleteConfirmUser._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteConfirmUser._id));
      setTotalUsers((prev) => Math.max(0, prev - 1));
      toast.success('User removed successfully');
      setDeleteConfirmUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsUpdating(false);
    }
  };

  // Stats calculation
  const providerCount = users.filter((u) => u.role === 'provider').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const verifiedCount = users.filter((u) => u.isVerified).length;

  const totalPages = Math.ceil(totalUsers / limit) || 1;

  return (
    <DashboardLayout navItems={ADMIN_NAV}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              View, filter, manage roles, and verify accounts across TrustHub.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            label="Total Accounts"
            value={totalUsers.toLocaleString()}
            sub="Registered on platform"
          />
          <StatCard
            icon={Briefcase}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            label="Service Providers"
            value={providerCount.toString()}
            sub="Active technicians & shops"
          />
          <StatCard
            icon={UserCheck}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            label="Verified Users"
            value={verifiedCount.toString()}
            sub="Identity confirmed"
          />
          <StatCard
            icon={Shield}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            label="Administrators"
            value={adminCount.toString()}
            sub="Staff & moderators"
          />
        </div>

        {/* ── Filters & Search Bar ── */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-600">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span>Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none text-xs font-bold text-gray-900 outline-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="provider">Providers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-600">
              <span>Status:</span>
              <select
                value={selectedVerified}
                onChange={(e) => {
                  setSelectedVerified(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none text-xs font-bold text-gray-900 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="true">Verified Only</option>
                <option value="false">Unverified</option>
              </select>
            </div>

            {(searchTerm || selectedRole !== 'all' || selectedVerified !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ── Users Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Location & Phone</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className="space-y-1.5">
                              <div className="w-28 h-3.5 bg-gray-200 rounded" />
                              <div className="w-36 h-3 bg-gray-100 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4"><div className="w-16 h-5 bg-gray-200 rounded-full" /></td>
                        <td className="py-4 px-4"><div className="w-24 h-4 bg-gray-200 rounded" /></td>
                        <td className="py-4 px-4"><div className="w-20 h-5 bg-gray-200 rounded-full" /></td>
                        <td className="py-4 px-4"><div className="w-20 h-3 bg-gray-100 rounded" /></td>
                        <td className="py-4 px-5 text-right"><div className="w-12 h-6 bg-gray-200 rounded ml-auto" /></td>
                      </tr>
                    ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-base font-semibold text-gray-800">No users found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search keywords.</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const roleInfo = ROLE_BADGES[u.role] || ROLE_BADGES.customer;
                    const isSelf = currentAdmin?._id === u._id || currentAdmin?.id === u._id;

                    return (
                      <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                        {/* User Identity */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden shadow-sm">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-10 h-10 object-cover" />
                              ) : (
                                u.name?.charAt(0).toUpperCase() || 'U'
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-900 truncate">{u.name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleInfo.bg}`}
                          >
                            {roleInfo.label}
                          </span>
                        </td>

                        {/* Location & Phone */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs text-gray-600 space-y-0.5">
                            <div className="flex items-center gap-1 text-gray-700">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span>{u.location?.city ? `${u.location.city}, ${u.location.state || 'IN'}` : 'Not specified'}</span>
                            </div>
                            {u.phone && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span>{u.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Verification */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleVerification(u)}
                            title="Click to toggle verification status"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                              u.isVerified
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {u.isVerified ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Verified</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-gray-400" />
                                <span>Unverified</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>
                              {u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : 'Recent'}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit user details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => setDeleteConfirmUser(u)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer ── */}
          <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              Showing <span className="font-semibold text-gray-800">{users.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
              <span className="font-semibold text-gray-800">{Math.min(page * limit, totalUsers)}</span> of{' '}
              <span className="font-semibold text-gray-800">{totalUsers}</span> users
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-gray-700 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── User Edit Modal ── */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-600" />
                  Edit User Details
                </h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-gray-600 rounded-lg p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Account Role</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="customer">Customer</option>
                      <option value="provider">Provider</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Verification</label>
                    <select
                      value={editFormData.isVerified ? 'true' : 'false'}
                      onChange={(e) => setEditFormData({ ...editFormData, isVerified: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="true">Verified</option>
                      <option value="false">Unverified</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Delete Confirmation Modal ── */}
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete User Account?</h3>
              <p className="text-xs text-gray-500 mt-2">
                Are you sure you want to permanently delete <strong className="text-gray-800">{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors flex-1 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors flex-1 disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
