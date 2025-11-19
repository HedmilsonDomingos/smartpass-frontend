import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';

const EmployeeDetails = () => {
  const { id } = useParams(); // Get employee ID from URL
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  // === EMPLOYEE STATE ===
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // === FETCH EMPLOYEE FROM DATABASE ===
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await api.get(`/api/employees/${id}`);

        setEmployee(res.data);
        setLoading(false);
      } catch (err) {
        alert('Employee not found or access denied.');
        navigate('/AllEmployees');
      }
    };

    fetchEmployee();
  }, [id, token, navigate]);

  // === DOWNLOAD QR CODE AS PNG ===
  const downloadQRCode = async () => {
    if (!employee?.qrCode) return;

    setDownloading(true);
    try {
      const response = await fetch(employee.qrCode);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${employee.fullName.replace(/\s+/g, '_')}_QR_Code.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download QR code.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xl">Loading employee details...</div>;
  }

  if (!employee) {
    return <div className="p-12 text-center text-xl text-red-600">Employee not found.</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex flex-wrap gap-2 mb-4 text-sm">
            <Link to="/" className="text-[#616f89] hover:text-primary">Dashboard</Link>
            <span className="text-[#616f89]">/</span>
            <Link to="/employees" className="text-[#616f89] hover:text-primary">Employees</Link>
            <span className="text-[#616f89]">/</span>
            <span className="text-[#111318] dark:text-gray-200 font-medium">{employee.fullName}</span>
          </div>

          {/* Header */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#111318] dark:text-white">{employee.fullName}</h1>
              <p className="text-base text-[#616f89] dark:text-gray-400">{employee.cargo || 'Employee'}</p>
            </div>
            <div className="flex gap-3">
              <button className="h-10 px-4 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                Actions <span className="material-symbols-outlined text-base">expand_more</span>
              </button>
              <Link
                to={`/employees/edit/${employee._id}`}
                className="h-10 px-4 bg-primary text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Edit Employee
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN: Profile + QR */}
            <div className="flex flex-col gap-8">

              {/* Profile Card */}
              <div className="bg-white dark:bg-background-dark rounded-xl p-6 text-center border dark:border-gray-700/50">
                <div
                  className="w-24 h-24 rounded-full bg-cover bg-center mx-auto mb-4"
                  style={{ backgroundImage: `url(${employee.profilePic || 'https://via.placeholder.com/96'})` }}
                ></div>
                <h2 className="text-xl font-bold">{employee.fullName}</h2>
                <p className="text-sm text-[#616f89] dark:text-gray-400">
                  {employee.cargo}, {employee.department}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/40 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                  <span className="size-2 rounded-full bg-green-500"></span>
                  Active
                </span>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">ID: {employee.employeeId || 'N/A'}</p>
              </div>

              {/* QR Code Card */}
              <div className="bg-white dark:bg-background-dark rounded-xl p-6 border dark:border-gray-700/50">
                <h3 className="text-lg font-semibold mb-4 self-start">Employee QR Code</h3>
                <div className="flex justify-center">
                  <img
                    src={employee.qrCode}
                    alt="QR Code"
                    className="w-full max-w-[200px] h-auto rounded-lg"
                  />
                </div>
                <button
                  onClick={downloadQRCode}
                  disabled={downloading}
                  className="mt-6 w-full h-10 bg-primary text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  {downloading ? 'Downloading...' : 'Download QR Code'}
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Details */}
            <div className="lg:col-span-2 flex flex-col gap-8">

              {/* Contact Info */}
              <div className="bg-white dark:bg-background-dark rounded-xl p-6 border dark:border-gray-700/50">
                <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label className="text-xs text-[#616f89] dark:text-gray-400">Work Email</label>
                    <p className="text-sm font-medium">{employee.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[#616f89] dark:text-gray-400">Phone Number</label>
                    <p className="text-sm font-medium">{employee.phone || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[#616f89] dark:text-gray-400">Location / Office</label>
                    <p className="text-sm font-medium">{employee.location || 'Remote'}</p>
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="bg-white dark:bg-background-dark rounded-xl p-6 border dark:border-gray-700/50">
                <h3 className="text-lg font-semibold mb-6">Employment Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label className="text-xs text-[#616f89] dark:text-gray-400">Start Date</label>
                    <p className="text-sm font-medium">
                      {employee.startDate ? new Date(employee.startDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-[#616f89] dark:text-gray-400">Employee Type</label>
                    <p className="text-sm font-medium">{employee.type || 'Full-time'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[#616f89] dark:text-gray-400">Manager</label>
                    <p className="text-sm font-medium">{employee.manager || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[#616f89] dark:text-gray-400">Department</label>
                    <p className="text-sm font-medium">{employee.department || '—'}</p>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-white dark:bg-background-dark rounded-xl p-6 border dark:border-gray-700/50">
                <h3 className="text-lg font-semibold mb-6">System Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="col-span-2">
                    <label className="text-xs text-[#616f89] dark:text-gray-400">Public Page URL</label>
                    <a href={`https://smartpass.co/p/${employee.username || employee.fullName.toLowerCase().replace(/\s/g, '-')}`}
                       target="_blank" rel="noreferrer"
                       className="text-sm text-primary font-medium hover:underline block truncate">
                      smartpass.co/p/{employee.username || employee.fullName.toLowerCase().replace(/\s/g, '-')}
                    </a>
                  </div>
                  <div>
                    <label className="text-xs text-[#616f89] dark:text-gray-400">Date Created</label>
                    <p className="text-sm font-medium">
                      {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-[#616f89] dark:text-gray-400">Last Updated</label>
                    <p className="text-sm font-medium">
                      {employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDetails;
