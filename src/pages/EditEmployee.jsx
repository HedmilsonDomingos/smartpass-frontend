import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar.jsx';

const EditEmployee = () => {
  const { id } = useParams(); // Get employee ID from URL
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  // === EMPLOYEE DATA STATE ===
  const [employee, setEmployee] = useState({
    fullName: '',
    email: '',
    phone: '',
    mobile: '',
    jobTitle: '',
    department: '',
    category: '',
    company: '',
    isActive: true,
    profilePic: '',
    qrCode: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // === FETCH EMPLOYEE FROM DATABASE ===
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get(`https://smartpass-api.onrender.com/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setEmployee(res.data);
        setLoading(false);
      } catch (err) {
        setMessage({ text: 'Employee not found.', type: 'error' });
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, token, navigate]);

  // === HANDLE INPUT CHANGE ===
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmployee(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // === HANDLE PROFILE PICTURE UPLOAD ===
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const res = await axios.post(
        `https://smartpass-api.onrender.com/api/employees/${id}/upload-photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setEmployee(prev => ({ ...prev, profilePic: res.data.profilePic }));
      setMessage({ text: 'Profile picture updated!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to upload image.', type: 'error' });
    }
  };

  // === REGENERATE QR CODE ===
  const regenerateQR = async () => {
    setRegenerating(true);
    try {
      const res = await axios.post(
        `https://smartpass-api.onrender.com/api/employees/${id}/regenerate-qr`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmployee(prev => ({ ...prev, qrCode: res.data.qrCode }));
      setMessage({ text: 'QR Code regenerated!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to regenerate QR.', type: 'error' });
    } finally {
      setRegenerating(false);
    }
  };

  // === SAVE CHANGES ===
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `https://smartpass-api.onrender.com/api/employees/${id}`,
        employee,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ text: 'Employee updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-lg">Loading employee...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex flex-wrap gap-2 mb-6">
            <a href="/employees" className="text-[#616f89] hover:underline">All Employees</a>
            <span className="text-[#616f89]">/</span>
            <span className="text-[#111318] dark:text-white">Edit Employee</span>
          </div>

          {/* Title */}
          <div className="flex flex-wrap justify-between gap-3 mb-8">
            <div>
              <p className="text-4xl font-black tracking-tight">Edit Employee: {employee.fullName}</p>
              <p className="text-[#616f89] mt-2">Update the employee's information and QR code as needed.</p>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT: FORM */}
            <div className="lg:col-span-2 bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <h2 className="text-[22px] font-bold pb-5 border-b border-gray-200 dark:border-gray-800">
                Employee Information
              </h2>

              <div className="flex flex-col md:flex-row gap-6 items-start mt-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div
                      className="w-24 h-24 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${employee.profilePic || 'https://via.placeholder.com/96'})` }}
                    ></div>
                    <label className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 bg-primary rounded-full text-white cursor-pointer hover:bg-primary/90">
                      <span className="material-symbols-outlined text-base">edit</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <p className="text-sm text-[#616f89]">Profile Picture</p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 w-full">
                  <label className="flex flex-col">
                    <p className="text-base font-medium pb-2">Full Name</p>
                    <input name="fullName" value={employee.fullName} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary" />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-base font-medium pb-2">Email Address</p>
                    <input name="email" value={employee.email} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary" />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-base font-medium pb-2">Phone Number</p>
                    <input name="phone" value={employee.phone} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary" />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-base font-medium pb-2">Mobile Number</p>
                    <input name="mobile" value={employee.mobile} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary" />
                  </label>
                  <label className="flex flex-col sm:col-span-2">
                    <p className="text-base font-medium pb-2">Job Title</p>
                    <input name="jobTitle" value={employee.jobTitle} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary" />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-base font-medium pb-2">Department</p>
                    <select name="department" value={employee.department} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary">
                      <option>Engineering</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                      <option>Human Resources</option>
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <p className="text-base font-medium pb-2">Category</p>
                    <select name="category" value={employee.category} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary">
                      <option>Product Manager</option>
                      <option>Digital Marketing Specialist</option>
                      <option>Content Creator</option>
                    </select>
                  </label>
                  <label className="flex flex-col sm:col-span-2">
                    <p className="text-base font-medium pb-2">Company</p>
                    <input name="company" value={employee.company} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary" />
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT: STATUS + QR */}
            <div className="flex flex-col gap-8">
              {/* Status Toggle */}
              <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold mb-4">Status</h3>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-base text-[#616f89]">Employee account is Active</span>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={employee.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* QR Code */}
              <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                <h3 className="text-lg font-bold mb-4">Employee QR Code</h3>
                <div className="flex justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <img src={employee.qrCode} alt="QR Code" className="w-40 h-40" />
                </div>
                <button
                  onClick={regenerateQR}
                  disabled={regenerating}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  {regenerating ? 'Regenerating...' : 'Regenerate QR Code'}
                </button>
              </div>
            </div>
          </div>

          {/* SAVE BUTTONS */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => navigate('/employees')}
              className="h-12 px-6 bg-gray-100 dark:bg-gray-800 text-[#111318] dark:text-white rounded-lg font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-12 px-6 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditEmployee;