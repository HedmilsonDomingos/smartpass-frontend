import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // === FORM STATE ===
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    photo: '',
    cargo: '',
    role: 'Manager',
    isActive: true,
    forcePasswordChange: false,
    permissions: {
      addEmployees: false,
      editEmployees: false,
      deactivateEmployees: false,
      viewEmployees: false,
      generateQRCodes: false,
      revokeQRCodes: false,
      manageUsers: false,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [newPassword, setNewPassword] = useState('');

  // === FETCH USER DATA ===
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/api/users/${id}`);
        const user = res.data;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          photo: user.photo || '',
          cargo: user.cargo || '',
          role: user.role || 'Manager',
          isActive: user.isActive,
          forcePasswordChange: user.forcePasswordChange,
          permissions: user.permissions || formData.permissions,
        });
      } catch (err) {
        setMessage({ text: 'Failed to fetch user data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // === HANDLE INPUT CHANGE ===
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === 'photo') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, photo: reader.result }));
        };
        reader.readAsDataURL(file);
      }
      return;
    }
    if (type === 'checkbox') {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: { ...prev[parent], [child]: checked }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // === FORM SUBMIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    const payload = { ...formData };
    if (newPassword) {
      payload.password = newPassword;
    }

    try {
      await api.put(`/api/users/${id}`, payload);
      setMessage({ text: 'User updated successfully!', type: 'success' });
      setTimeout(() => navigate('/users'), 2000);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update user. Try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // === DELETE USER ===
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) {
      return;
    }
    try {
      await api.delete(`/api/users/${id}`);
      setMessage({ text: 'User deleted successfully.', type: 'success' });
      setTimeout(() => navigate('/users'), 2000);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to delete user.',
        type: 'error'
      });
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-lg">Loading user...</div>;
  }

  return (
    <div className="flex flex-row h-full text-white">
      <main className="flex-1 flex flex-col p-6 lg:p-10">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4 text-sm">
            <a href="/dashboard" className="text-gray-400">Dashboard</a>
            <span className="text-gray-400">/</span>
            <a href="/users" className="text-gray-400">Users</a>
            <span className="text-gray-400">/</span>
            <span className="text-white">Edit User</span>
          </div>
          <div className="flex flex-wrap justify-between gap-3 mb-8">
            <div className="flex min-w-72 flex-col gap-2">
              <p className="text-white text-3xl font-bold leading-tight tracking-tight">
                Edit User Account
              </p>
              <p className="text-gray-400 text-base font-normal leading-normal">
                Update user details, roles, and permissions.
              </p>
            </div>
          </div>
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="bg-gray-700 border border-gray-600 rounded-xl p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              <div className="flex flex-col gap-6">
                <h2 className="text-white text-xl font-bold">User Details</h2>
                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-medium pb-2">Photo</p>
                  <input
                    name="photo"
                    type="file"
                    onChange={handleChange}
                    className="form-input h-12 px-3 rounded-lg border border-gray-600 bg-gray-800 text-base"
                    accept="image/*"
                  />
                </label>
                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-medium pb-2">Full Name</p>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input h-12 px-3 rounded-lg border border-gray-600 bg-gray-800 text-base"
                    placeholder="Enter full name"
                    required
                  />
                </label>
                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-medium pb-2">Email Address</p>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input h-12 px-3 rounded-lg border border-gray-600 bg-gray-800 text-base"
                    placeholder="user@example.com"
                    required
                  />
                </label>
                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-medium pb-2">Cargo</p>
                  <input
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    className="form-input h-12 px-3 rounded-lg border border-gray-600 bg-gray-800 text-base"
                    placeholder="e.g. HR Manager"
                  />
                </label>
                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-medium pb-2">New Password</p>
                  <input
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input h-12 px-3 rounded-lg border border-gray-600 bg-gray-800 text-base"
                    placeholder="Leave blank to keep current password"
                  />
                </label>
              </div>
              <div className="flex flex-col gap-6">
                <h2 className="text-white text-xl font-bold">Roles and Permissions</h2>
                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-medium pb-2">User Role</p>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-select h-12 px-3 rounded-lg border border-gray-600 bg-gray-800 text-base"
                  >
                    <option>Administrator</option>
                    <option>Manager</option>
                    <option>Viewer</option>
                  </select>
                </label>
                <div className="flex flex-col gap-4">
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">
                    Fine-Grained Permissions
                  </h3>
                  <div className="border border-gray-600 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Employee Data</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      {['addEmployees', 'editEmployees', 'deactivateEmployees', 'viewEmployees'].map(perm => (
                        <label key={perm} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name={`permissions.${perm}`}
                            checked={formData.permissions[perm]}
                            onChange={handleChange}
                            className="form-checkbox h-5 w-5 rounded text-primary"
                          />
                          <span className="text-gray-300 text-sm font-medium">
                            {perm.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border border-gray-600 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">QR Code Management</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      {['generateQRCodes', 'revokeQRCodes'].map(perm => (
                        <label key={perm} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name={`permissions.${perm}`}
                            checked={formData.permissions[perm]}
                            onChange={handleChange}
                            className="form-checkbox h-5 w-5 rounded text-primary"
                          />
                          <span className="text-gray-300 text-sm font-medium">
                            {perm.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border border-gray-600 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">System Administration</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="permissions.manageUsers"
                          checked={formData.permissions.manageUsers}
                          onChange={handleChange}
                          className="form-checkbox h-5 w-5 rounded text-primary"
                        />
                        <span className="text-gray-300 text-sm font-medium">
                          Manage User Accounts
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-8 border-t border-gray-600 pt-6">
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 h-12 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Delete User
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 h-12 rounded-lg border border-gray-600 bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 h-12 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditUser;
