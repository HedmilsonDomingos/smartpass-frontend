import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';

const User = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  // === SAFE DATE FORMATTER ===
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  // === STATE ===
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  // === FETCH USERS FROM DATABASE ===
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/users', { params: { page, limit, search } });

        setUsers(res.data.users);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.message;
        
        if (status === 401) {
          alert('Session expired. Please log in again.');
          navigate('/login');
        } else {
          alert(`Failed to load users: ${msg}`);
        }
        setLoading(false);
      }
    };

    if (token) fetchUsers();
  }, [token, page, search, navigate]);

  // === DELETE USER ===
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;

    try {
      await api.delete(`/api/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      alert('User deleted!');
    } catch (err) {
      alert('Delete failed. Only admins can delete.');
    }
  };

  return (
    <div className="flex min-h-screen text-white">
      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="text-gray-400">Manage all registered system users, their details, and assigned privileges.</p>
            </div>

            {/* ADD USER BUTTON */}
            <Link
              to="/adduser"
              className="flex items-center gap-2 h-10 px-4 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add New User
            </Link>
          </div>

          {/* Card */}
          <div className="bg-gray-700 border border-gray-600 rounded-xl shadow-sm">

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-600">
              <div className="flex h-10 rounded-lg bg-gray-800/50 max-w-md">
                <div className="flex items-center pl-3.5 text-gray-400">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">User</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Role</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Date Added</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-10">Loading users...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">No users found.</td></tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-800/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-400 ml-4 hidden md:block">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{user.role}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {user.isActive ? 'Active' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* EDIT USER BUTTON */}
                            <Link
                              to={`/EditUser/${user._id}`}
                              className="p-2 text-gray-500 hover:text-primary rounded-md"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </Link>

                            {/* DELETE USER BUTTON */}
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="p-2 text-gray-500 hover:text-red-500 rounded-md"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-600 px-4 py-3">
              <p className="text-sm text-gray-400">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, users.length + (page - 1) * limit)} of {totalPages * limit} results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-600 rounded-md disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 border border-gray-600 rounded-md disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default User;
