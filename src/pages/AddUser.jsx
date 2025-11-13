import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar.jsx';

const AddUser = () => {
  // === FORM STATE ===
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    role: 'Manager', // Default
    forcePasswordChange: true,
    permissions: {
      addEmployees: true,
      editEmployees: true,
      deactivateEmployees: false,
      viewEmployees: true,
      generateQRCodes: true,
      revokeQRCodes: false,
      manageUsers: false,
    },
  });

  const [tempPassword, setTempPassword] = useState('');     // Auto-generated
  const [showPassword, setShowPassword] = useState(false);  // Toggle visibility
  const [loading, setLoading] = useState(false);            // Submit state
  const [message, setMessage] = useState({ text: '', type: '' }); // Success/Error
  const navigate = useNavigate();

  // === GENERATE SECURE TEMP PASSWORD ===
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(password);
  };

  // Auto-generate on mount
  React.useEffect(() => {
    generatePassword();
  }, []);

  // === HANDLE INPUT CHANGE ===
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setMessage({ text: 'First name, last name, and email are required.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`,
        tempPassword,
        status: 'Active',
        // Map permissions to backend format if needed
      };

      // SEND TO YOUR BACKEND
      await axios.post('https://smartpass-api.onrender.com/api/users', payload); // CHANGE TO YOUR API

      setMessage({ text: 'User added successfully! They can now log in.', type: 'success' });
      setTimeout(() => navigate('/users'), 2000); // Redirect after success
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to add user. Try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row h-full">
      <Sidebar />

      {/* === MAIN CONTENT === */}
      <main className="flex-1 flex flex-col p-6 lg:p-10">
        <div className="w-full max-w-7xl mx-auto">
          {/* BREADCRUMB */}
          <div className="flex flex-wrap gap-2 mb-4 text-sm">
            <a href="#" className="text-gray-500">Dashboard</a>
            <span className="text-gray-500">/</span>
            <a href="#" className="text-gray-500">Users</a>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900 dark:text-white">Add New User</span>
          </div>

          {/* TITLE */}
          <div className="flex flex-wrap justify-between gap-3 mb-8">
            <div className="flex min-w-72 flex-col gap-2">
              <p className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
                Add New User Account
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">
                Create a new account with specific roles and permissions.
              </p>
            </div>
          </div>

          {/* SUCCESS / ERROR MESSAGE */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              {/* === USER DETAILS === */}
              <div className="flex flex-col gap-6">
                <h2 className="text-gray-900 dark:text-white text-xl font-bold">User Details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col w-full">
                    <p className="text-gray-900 dark:text-white text-sm font-medium pb-2">First Name</p>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-input h-12 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-base"
                      placeholder="Enter first name"
                      required
                    />
                  </label>
                  <label className="flex flex-col w-full">
                    <p className="text-gray-900 dark:text-white text-sm font-medium pb-2">Last Name</p>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-input h-12 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-base"
                      placeholder="Enter last name"
                      required
                    />
                  </label>
                </div>

                <label className="flex flex-col w-full">
                  <p className="text-gray-900 dark:text-white text-sm font-medium pb-2">Email Address</p>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input h-12 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-base"
                    placeholder="user@example.com"
                    required
                  />
                </label>

                <label className="flex flex-col w-full">
                  <p className="text-gray-900 dark:text-white text-sm font-medium pb-2">Job Title</p>
                  <input
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="form-input h-12 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-base"
                    placeholder="e.g. HR Manager"
                  />
                </label>

                {/* TEMP PASSWORD */}
                <div className="flex flex-col w-full">
                  <p className="text-gray-900 dark:text-white text-sm font-medium pb-2">Temporary Password</p>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={tempPassword}
                      readOnly
                      className="form-input h-12 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-base pr-32"
                    />
                    <div className="absolute right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-gray-800"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPassword ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>

                {/* FORCE PASSWORD CHANGE */}
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="forcePasswordChange"
                    checked={formData.forcePasswordChange}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 rounded text-primary"
                  />
                  <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                    Force password change on first login
                  </p>
                </label>
              </div>

              {/* === ROLES & PERMISSIONS === */}
              <div className="flex flex-col gap-6">
                <h2 className="text-gray-900 dark:text-white text-xl font-bold">Roles and Permissions</h2>

                <label className="flex flex-col w-full">
                  <p className="text-gray-900 dark:text-white text-sm font-medium pb-2">User Role</p>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-select h-12 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-base"
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

                  {/* Employee Data */}
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <h4 className="text-gray-900 dark:text-white font-semibold mb-3">Employee Data</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      {['addEmployees', 'editEmployees', 'deactivateEmployees', 'viewEmployees'].map(perm => (
                        <label key={perm} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name={`permissions.${perm}`}
                            checked={formData.permissions[perm]}
                            onChange={handleChange}
                            className="form-checkbox h-5 w-5 rounded text-primary"
                            disabled={perm === 'manageUsers'} // Example lock
                          />
                          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                            {perm.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* QR Code Management */}
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <h4 className="text-gray-900 dark:text-white font-semibold mb-3">QR Code Management</h4>
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
                          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                            {perm.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* System Admin */}
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <h4 className="text-gray-900 dark:text-white font-semibold mb-3">System Administration</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="permissions.manageUsers"
                          checked={formData.permissions.manageUsers}
                          onChange={handleChange}
                          className="form-checkbox h-5 w-5 rounded text-primary"
                          disabled
                        />
                        <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">
                          Manage User Accounts
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* === ACTION BUTTONS === */}
            <div className="flex justify-end gap-3 mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 h-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 h-12 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddUser;