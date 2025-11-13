import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminProfile = () => {
  // === AUTH & NAVIGATION ===
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken'); // From login

  // === STATE ===
  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
    email: '',
    role: '',
    avatar: '',
    lastPasswordChange: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', username: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // === FETCH LOGGED-IN USER PROFILE FROM API ===
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('https://smartpass-api.onrender.com/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = response.data;
        setProfile({
          fullName: user.fullName || '',
          username: user.username || '',
          email: user.email || '',
          role: user.role || 'Admin',
          avatar: user.avatar || 'https://via.placeholder.com/96',
          lastPasswordChange: user.lastPasswordChange || 'Never'
        });
        setFormData({
          fullName: user.fullName || '',
          username: user.username || ''
        });
        setLoading(false);
      } catch (err) {
        setMessage({ text: 'Failed to load profile. Please log in again.', type: 'error' });
        setLoading(false);
        if (err.response?.status === 401) navigate('/login');
      }
    };

    fetchProfile();
  }, [token, navigate]);

  // === HANDLE INPUT CHANGE ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // === SAVE PROFILE CHANGES ===
  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      await axios.put('https://smartpass-api.onrender.com/api/users/me', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(prev => ({ ...prev, ...formData }));
      setEditMode(false);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // === RENDER LOADING ===
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="layout-container flex h-full grow">
      {/* === SIDEBAR === */}
      <div className="flex flex-col gap-4 p-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark w-64">
        <div className="flex gap-3 items-center px-3">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAlFxWwCwOteOGrLEIUAFPLvG1j_av3YaAGFwqxmfd0wPNN95hVww5dJXf7zYodEAXWPZKGHgf-7PV-pCOATvpeLirYyKsxe6LneB3IOaL-fHAqRn6XtTr79nFdlryk_c7oZMGraXaK1Skc9k1biTiPhOF8aZZLTazp6muDFWJh3m9hfmFYRephoyN3T-d4ODzI10seVahOT7JZTZ974WiFqrLghd0Df3vg-QzstmGI96obfLai9s7W-Tb7py6W-xFB0P2XH1qGNia_')" }}
          ></div>
          <div>
            <h1 className="text-[#111318] dark:text-white text-base font-medium">SmartPass</h1>
            <p className="text-[#616f89] dark:text-gray-400 text-sm">Admin Panel</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
            <span className="material-symbols-outlined text-[#111318] dark:text-white/90">dashboard</span>
            <p className="text-[#111318] dark:text-white/90 text-sm font-medium">Dashboard</p>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 dark:bg-primary/20">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <p className="text-primary text-sm font-medium">Profile</p>
          </a>
          {/* Add other nav items */}
        </div>

        {/* LOGOUT */}
        <div className="flex flex-col gap-4 mt-auto">
          <div className="flex gap-3 items-center p-3 border-t border-gray-200 dark:border-gray-700">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{ backgroundImage: `url(${profile.avatar})` }}
            ></div>
            <div>
              <p className="text-[#111318] dark:text-white text-sm font-medium">{profile.fullName}</p>
              <p className="text-[#616f89] dark:text-gray-400 text-xs">{profile.email}</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('authToken');
                navigate('/login');
              }}
              className="ml-auto text-[#616f89] hover:text-[#111318] dark:hover:text-white"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="layout-content-container flex flex-col mx-auto max-w-4xl gap-8">

          {/* TITLE */}
          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex min-w-72 flex-col gap-2">
              <p className="text-[#111318] dark:text-white text-4xl font-black tracking-[-0.033em]">My Profile</p>
              <p className="text-[#616f89] dark:text-gray-400 text-base">View and manage your account details.</p>
            </div>
          </div>

          {/* SUCCESS / ERROR MESSAGE */}
          {message.text && (
            <div className={`p-4 rounded-lg text-sm font-medium ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* PROFILE CARD */}
          <div className="flex p-6 bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
              <div className="flex gap-6 items-center">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 ring-4 ring-white dark:ring-background-dark"
                  style={{ backgroundImage: `url(${profile.avatar})` }}
                ></div>
                <div>
                  <p className="text-[#111318] dark:text-white text-[22px] font-bold">{profile.fullName}</p>
                  <p className="text-[#616f89] dark:text-gray-400 text-base">{profile.email}</p>
                  <p className="text-[#616f89] dark:text-gray-400 text-base">Role: {profile.role}</p>
                </div>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="h-10 px-4 bg-[#f0f2f4] dark:bg-white/10 text-[#111318] dark:text-white/90 rounded-lg text-sm font-bold w-full max-w-[480px] @[480px]:w-auto"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* PERSONAL INFO FORM */}
          <div className="flex flex-col gap-6 bg-white dark:bg-background-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-[#111318] dark:text-white text-lg font-bold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col">
                <p className="text-[#111318] dark:text-white/90 text-base font-medium pb-2">Full Name</p>
                <input
                  name="fullName"
                  value={editMode ? formData.fullName : profile.fullName}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`form-input h-12 px-4 rounded-lg border-none bg-[#f0f2f4] dark:bg-white/5 text-base ${
                    editMode ? 'text-[#111318] dark:text-white/90' : 'text-[#616f89] dark:text-gray-400 cursor-not-allowed'
                  }`}
                />
              </div>
              <div className="flex flex-col">
                <p className="text-[#111318] dark:text-white/90 text-base font-medium pb-2">Username</p>
                <input
                  name="username"
                  value={editMode ? formData.username : profile.username}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`form-input h-12 px-4 rounded-lg border-none bg-[#f0f2f4] dark:bg-white/5 text-base ${
                    editMode ? 'text-[#111318] dark:text-white/90' : 'text-[#616f89] dark:text-gray-400 cursor-not-allowed'
                  }`}
                />
              </div>
              <div className="flex flex-col">
                <p className="text-[#111318] dark:text-white/90 text-base font-medium pb-2">Email Address</p>
                <input
                  value={profile.email}
                  disabled
                  className="form-input h-12 px-4 rounded-lg border-none bg-[#f0f2f4] dark:bg-white/5 text-[#616f89] dark:text-gray-400 text-base cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-[#111318] dark:text-white/90 text-base font-medium pb-2">Role</p>
                <input
                  value={profile.role}
                  disabled
                  className="form-input h-12 px-4 rounded-lg border-none bg-[#f0f2f4] dark:bg-white/5 text-[#616f89] dark:text-gray-400 text-base cursor-not-allowed"
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {editMode && (
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData({ fullName: profile.fullName, username: profile.username });
                  }}
                  className="h-10 px-4 bg-[#f0f2f4] dark:bg-white/10 text-[#111318] dark:text-white/90 rounded-lg text-sm font-bold"
                >
                  Cancel
                </button>
              )}
              {editMode ? (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              ) : null}
            </div>
          </div>

          {/* SECURITY SECTION */}
          <div className="flex flex-col gap-6 bg-white dark:bg-background-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-[#111318] dark:text-white text-lg font-bold">Security</h3>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-[#111318] dark:text-white/90 font-medium">Password</p>
                <p className="text-[#616f89] dark:text-gray-400">
                  Last changed on {new Date(profile.lastPasswordChange).toLocaleDateString() || 'Never'}
                </p>
              </div>
              <button
                onClick={() => navigate('/change-password')}
                className="h-10 px-4 bg-[#f0f2f4] dark:bg-white/10 text-[#111318] dark:text-white/90 rounded-lg text-sm font-bold"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfile;