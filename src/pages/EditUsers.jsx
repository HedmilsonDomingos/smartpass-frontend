import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar.jsx';

const EditUser = () => {
  const { id } = useParams(); // User ID from URL
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  // === USER DATA STATE ===
  const [user, setUser] = useState({
    fullName: '',
    username: '',
    email: '',
    profilePic: '',
    isActive: true,
    lastLogin: '',
    roles: [], // e.g., ['Administrator']
    permissions: {
      canCreateUsers: true,
      canExportData: false,
      canManageBilling: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // === FETCH USER FROM DATABASE ===
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get(`https://smartpass-api.onrender.com/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setUser({
          fullName: data.fullName || '',
          username: data.username || '',
          email: data.email || '',
          profilePic: data.profilePic || 'https://via.placeholder.com/96',
          isActive: data.isActive !== false,
          lastLogin: data.lastLogin || 'Never',
          roles: data.roles || [],
          permissions: {
            canCreateUsers: data.permissions?.canCreateUsers || false,
            canExportData: data.permissions?.canExportData || false,
            canManageBilling: data.permissions?.canManageBilling || false,
          },
        });
        setLoading(false);
      } catch (err) {
        setMessage({ text: 'User not found.', type: 'error' });
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, token, navigate]);

  // === HANDLE INPUT CHANGES ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  // === HANDLE ROLE CHECKBOX ===
  const handleRoleChange = (role) => {
    setUser(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }));
  };

  // === HANDLE PERMISSION TOGGLE ===
  const handlePermissionChange = (perm) => {
    setUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [perm]: !prev.permissions[perm],
      },
    }));
  };

  // === UPLOAD PROFILE PHOTO ===
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const res = await axios.post(
        `https://smartpass-api.onrender.com/api/users/${id}/photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUser(prev => ({ ...prev, profilePic: res.data.profilePic }));
      setMessage({ text: 'Photo updated!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to upload photo.', type: 'error' });
    }
  };

  // === SUSPEND / ACTIVATE USER ===
  const suspendUser = async () => {
    if (!window.confirm('Are you sure you want to suspend this account?')) return;

    try {
      await axios.post(
        `https://smartpass-api.onrender.com/api/users/${id}/suspend`,
        { isActive: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(prev => ({ ...prev, isActive: false }));
      setMessage({ text: 'User suspended.', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to suspend user.', type: 'error' });
    }
  };

  // === SAVE ALL CHANGES ===
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `https://smartpass-api.onrender.com/api/users/${id}`,
        {
          fullName: user.fullName,
          email: user.email,
          roles: user.roles,
          permissions: user.permissions,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: 'User updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-lg">Loading user...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex flex-wrap gap-2 mb-4 text-sm">
            <a href="/" className="text-[#616f89] hover:text-primary">Dashboard</a>
            <span className="text-[#616f89]">/</span>
            <a href="/users" className="text-[#616f89] hover:text-primary">Users</a>
            <span className="text-[#616f89]">/</span>
            <span className="text-[#111318] dark:text-white">Edit {user.fullName}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black mb-8">Edit User</h1>

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white dark:bg-background-dark rounded-xl p-6 mb-8 border dark:border-gray-700">
            <div className="flex flex-col gap-4 @[520px]:flex-row @[520px]:justify-between">
              <div className="flex gap-4 items-center">
                <div
                  className="w-24 h-24 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${user.profilePic})` }}
                ></div>
                <div>
                  <p className="text-[22px] font-bold">{user.fullName}</p>
                  <p className="text-[#616f89] dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <label className="h-10 px-4 bg-[#f0f2f4] dark:bg-white/10 rounded-lg font-bold cursor-pointer hover:bg-[#e6e8eb] dark:hover:bg-white/20">
                Change Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT: Profile + Status */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-background-dark rounded-xl p-6 border dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <label className="flex flex-col">
                    <p className="text-sm font-medium pb-2">Full Name</p>
                    <input name="fullName" value={user.fullName} onChange={handleChange}
                      className="h-12 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary" />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium pb-2">Username</p>
                    <input value={user.username} disabled
                      className="h-12 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-[#616f89] cursor-not-allowed" />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium pb-2">Email</p>
                    <input name="email" type="email" value={user.email} onChange={handleChange}
                      className="h-12 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary" />
                  </label>
                </div>
              </div>

              <div className="bg-white dark:bg-background-dark rounded-xl p-6 border dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4">Account Status</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <p className="font-medium">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-medium">Last Login</p>
                    <p className="text-[#616f89] dark:text-gray-400">
                      {new Date(user.lastLogin).toLocaleString() || 'Never'}
                    </p>
                  </div>
                  <button
                    onClick={suspendUser}
                    className="w-full mt-2 h-10 border border-destructive text-destructive rounded-lg font-bold hover:bg-destructive/10"
                  >
                    {user.isActive ? 'Suspend Account' : 'Account Suspended'}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Roles & Permissions */}
            <div className="lg:col-span-2 bg-white dark:bg-background-dark rounded-xl p-6 border dark:border-gray-700">
              <h3 className="text-lg font-bold mb-4">System Roles & Permissions</h3>
              <div className="space-y-6">

                {/* Roles */}
                <div>
                  <h4 className="text-base font-semibold mb-3">Roles</h4>
                  <div className="space-y-3">
                    {['Administrator', 'Manager', 'Viewer'].map(role => (
                      <label key={role} className="flex items-center space-x-3 p-3 rounded-lg border border-[#dbdfe6] dark:border-gray-600 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user.roles.includes(role)}
                          onChange={() => handleRoleChange(role)}
                          className="h-5 w-5 rounded text-primary focus:ring-primary/50"
                        />
                        <span className="text-sm font-medium">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h4 className="text-base font-semibold mb-3">Specific Privileges</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'canCreateUsers', label: 'Can create new users' },
                      { key: 'canExportData', label: 'Can export data' },
                      { key: 'canManageBilling', label: 'Can manage billing' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-[#dbdfe6] dark:border-gray-600">
                        <span className="text-sm font-medium">{item.label}</span>
                        <label className="relative inline-block w-11 h-6">
                          <input
                            type="checkbox"
                            checked={user.permissions[item.key]}
                            onChange={() => handlePermissionChange(item.key)}
                            className="opacity-0 w-0 h-0"
                          />
                          <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#dbdfe6] rounded-full transition ${user.permissions[item.key] ? 'bg-primary' : ''} before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition ${user.permissions[item.key] ? 'before:translate-x-5' : ''}`}></span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SAVE BUTTONS */}
          <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={() => navigate('/users')}
              className="h-11 px-6 border border-[#dbdfe6] dark:border-gray-600 rounded-lg font-bold hover:bg-black/5 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-11 px-6 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditUser;