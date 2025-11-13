import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  // === USER SETTINGS STATE ===
  const [settings, setSettings] = useState({
    darkMode: false,
    language: 'English (United States)',
    timezone: '(GMT+01:00) Central European Time',
  });

  // === PASSWORD CHANGE STATE ===
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // === UI STATE ===
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // === FETCH CURRENT SETTINGS FROM DB ===
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('https://smartpass-api.onrender.com/api/users/me/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data;
        setSettings({
          darkMode: data.darkMode || false,
          language: data.language || 'English (United States)',
          timezone: data.timezone || '(GMT+01:00) Central European Time',
        });

        // Apply dark mode immediately
        if (data.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        setLoading(false);
      } catch (err) {
        setMessage({ text: 'Failed to load settings.', type: 'error' });
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token, navigate]);

  // === HANDLE GENERAL SETTINGS CHANGE ===
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // Auto-save dark mode toggle
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', value);
      saveSettings({ darkMode: value });
    }
  };

  // === SAVE GENERAL SETTINGS TO DB ===
  const saveSettings = async (updatedFields = settings) => {
    setSaving(true);
    try {
      await axios.put('https://smartpass-api.onrender.com/api/users/me/settings', updatedFields, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: 'Settings saved successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to save settings.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // === HANDLE PASSWORD CHANGE ===
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'New passwords do not match!', type: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ text: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }

    try {
      await axios.put('https://smartpass-api.onrender.com/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to change password.', type: 'error' });
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-lg">Loading settings...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* === SIDEBAR === */}
      <nav className="flex w-64 flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4">
        <div className="flex h-full flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-2">
              <span className="material-symbols-outlined text-primary text-3xl">qr_code_scanner</span>
              <h1 className="text-text-light-primary dark:text-dark-primary text-xl font-bold">SmartPass</h1>
            </div>
            <div className="flex flex-col gap-1 pt-4">
              {/* Other nav items */}
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined fill">settings</span>
                <p className="text-sm font-medium">Settings</p>
              </a>
            </div>
          </div>

          {/* User + Logout */}
          <div className="flex flex-col gap-1 border-t border-border-light dark:border-border-dark pt-2">
            <div className="flex items-center gap-3 p-2">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD0HsjfCIzgacyUP8ze9zPf0j_1U4WBeqSZ1lpN8bj_XHkLE72flKq0eu6BKEVCCENkRRIlK9kKUvQzb76ZzTaPYtF28q7iSIHRZVWVzfOn70e4pP_bC7Ad7q0CMLNQGqKMjGpE6cGUdG1vIJsgfeWrcMWTfKaPvOUHZDOYxsRXjmaaS3aBG8cV5RbaBT6e13X59ZkOlowH_Wi1DQtJgH2Hr8Qlo5vF0y2igDYG0YUj1qeRZyHN-H3kTzKh5qYgF0H7brsA-LhuQuIY')" }}></div>
              <div>
                <h2 className="text-text-light-primary dark:text-dark-primary text-sm font-medium">Admin</h2>
                <p className="text-text-light-secondary dark:text-dark-secondary text-xs">admin@smartpass.com</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('authToken');
                navigate('/login');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-danger/10 text-danger"
            >
              <span className="material-symbols-outlined">logout</span>
              <p className="text-sm font-medium">Log Out</p>
            </button>
          </div>
        </div>
      </nav>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-6 sm:p-8 lg:p-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap justify-between gap-3 pb-8">
            <h1 className="text-text-light-primary dark:text-dark-primary text-4xl font-black tracking-[-0.033em]">
              Settings
            </h1>
          </div>

          {/* SUCCESS / ERROR MESSAGE */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex flex-col gap-8">

            {/* === GENERAL SETTINGS === */}
            <section>
              <h2 className="text-text-light-primary dark:text-dark-primary text-[22px] font-bold pb-3 border-b border-border-light dark:border-border-dark">
                General
              </h2>
              <div className="pt-6 space-y-6">

                {/* Dark Mode */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border_border-light dark:border-border-dark">
                  <h3 className="text-lg font-semibold pb-1">Interface Theme</h3>
                  <p className="text-sm text-text-light-secondary dark:text-dark-secondary pb-6">
                    Select or customize your interface theme.
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-medium">Dark Mode</p>
                    <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full bg-background-light dark:bg-background-dark p-0.5 has-[:checked]:bg-primary">
                      <div className="h-full w-[27px] rounded-full bg-white transition-transform has-[:checked]:translate-x-full shadow-sm"></div>
                      <input
                        type="checkbox"
                        checked={settings.darkMode}
                        onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                        className="invisible absolute"
                      />
                    </label>
                  </div>
                </div>

                {/* Language & Timezone */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
                  <h3 className="text-lg font-semibold pb-1">Application Defaults</h3>
                  <p className="text-sm text-text-light-secondary dark:text-dark-secondary pb-6">
                    Set your default preferences for the application.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col">
                      <p className="text-sm font-medium pb-2">Language</p>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="form-select h-12 px-3 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:border-primary"
                      >
                        <option>English (United States)</option>
                        <option>Português (Angola)</option>
                        <option>Español (España)</option>
                        <option>Français (France)</option>
                      </select>
                    </label>
                    <label className="flex flex-col">
                      <p className="text-sm font-medium pb-2">Time Zone</p>
                      <select
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                        className="form-select h-12 px-3 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:border-primary"
                      >
                        <option>(GMT+01:00) West Africa Time (Luanda)</option>
                        <option>(GMT-08:00) Pacific Time</option>
                        <option>(GMT+00:00) Greenwich Mean Time</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* === SECURITY === */}
            <section>
              <h2 className="text-text-light-primary dark:text-dark-primary text-[22px] font-bold pb-3 border-b border-border-light dark:border-border-dark">
                Security
              </h2>
              <div className="pt-6 space-y-6">
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
                  <h3 className="text-lg font-semibold pb-1">Password Management</h3>
                  <p className="text-sm text-text-light-secondary dark:text-dark-secondary pb-6">
                    Update your password regularly to keep your account secure.
                  </p>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <label className="flex flex-col">
                      <p className="text-sm font-medium pb-2">Current Password</p>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="form-input h-12 px-3 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:border-primary"
                        required
                      />
                    </label>
                    <label className="flex flex-col">
                      <p className="text-sm font-medium pb-2">New Password</p>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="form-input h-12 px-3 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:border-primary"
                        required
                      />
                    </label>
                    <label className="flex flex-col">
                      <p className="text-sm font-medium pb-2">Confirm New Password</p>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="form-input h-12 px-3 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:border-primary"
                        required
                      />
                    </label>
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="h-11 px-6 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                        disabled={saving}
                      >
                        {saving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>

            {/* === SAVE ALL BUTTONS === */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => navigate(-1)}
                className="h-11 px-6 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary font-medium hover:bg-black/5 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => saveSettings()}
                disabled={saving}
                className="h-11 px-6 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;