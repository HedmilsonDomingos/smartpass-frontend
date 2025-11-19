// src/pages/AllEmployees.jsx
// src/pages/AllEmployees.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const AllEmployees = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  // === STATE ===
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All'); // New state for company filter
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showQR, setShowQR] = useState(null);

  const employeesPerPage = 10;

  // === FETCH EMPLOYEES FROM DATABASE ===
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: employeesPerPage,
          search,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          company: companyFilter !== 'All' ? companyFilter : undefined, // Add company filter
        };
        const response = await api.get('/api/employees', { params });

        setEmployees(response.data.employees || response.data);
        setTotalPages(response.data.totalPages || Math.ceil((response.data.employees || response.data).length / employeesPerPage));
        setLoading(false);
      } catch (err) {
        console.error('Failed to load employees:', err);
        setLoading(false);
        setEmployees([]);
      }
    };

    if (token) {
      fetchEmployees();
    } else {
      navigate('/login');
    }
  }, [token, page, search, statusFilter, companyFilter, navigate]); // Add companyFilter to dependencies

  // === DELETE EMPLOYEE ===
  const deleteEmployee = async (id) => {
    if (!window.confirm('Delete this employee permanently?')) return;

    try {
      await api.delete(`/api/employees/${id}`);
      setEmployees(employees.filter(e => e._id !== id));
      alert('Employee deleted!');
    } catch (err) {
      alert('Delete failed.');
    }
  };

  // === CLOSE QR MODAL ===
  const closeQRModal = () => {
    setShowQR(null);
  };

  return (
    <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">All Employees</h1>
              <p className="text-gray-400">Manage employee QR codes and public information pages.</p>
            </div>

            {/* ADD EMPLOYEE BUTTON */}
            <Link
              to="/AddEmployee"
              className="flex items-center gap-2 h-10 px-4 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add New Employee
            </Link>
          </div>

          {/* Card */}
          <div className="bg-gray-700 border border-gray-600 rounded-xl shadow-sm">

            {/* Search & Filter Bar */}
            <div className="p-4 border-b border-gray-600 space-y-3">
              <div className="flex h-10 rounded-lg bg-gray-800/50 max-w-md">
                <div className="flex items-center pl-3.5 text-gray-400">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  type="text"
                  placeholder="Search by Department or Company..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 bg-transparent outline-none text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Company Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-300">Company:</label>
                  <select
                    value={companyFilter}
                    onChange={(e) => {
                      setCompanyFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 px-3 rounded-lg border border-gray-600 bg-gray-800 text-sm"
                  >
                    <option>All</option>
                    <option>SmartPass HQ</option>
                    <option>Tech Solutions Inc.</option>
                    <option>Global Logistics</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-300">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 px-3 rounded-lg border border-gray-600 bg-gray-800 text-sm"
                  >
                    <option>All</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Employee Name</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Employee ID</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Email</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Department</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Company</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-10 text-gray-500">Loading employees...</td></tr>
                  ) : employees.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-10 text-gray-500">No employees found.</td></tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-gray-800/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${emp.profilePic || 'https://via.placeholder.com/32'})` }}
                            ></div>
                            <span className="text-sm font-medium text-gray-400">{emp.fullName || emp.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{emp.employeeId}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{emp.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{emp.department || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{emp.company || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emp.status === 'Active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {emp.status === 'Active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* VIEW QR BUTTON */}
                            <button
                              onClick={() => setShowQR(emp)}
                              className="p-2 text-gray-500 hover:text-primary rounded-md"
                              title="View QR Code"
                            >
                              <span className="material-symbols-outlined text-lg">qr_code_2</span>
                            </button>

                            {/* EDIT BUTTON */}
                            <Link
                              to={`/EditEmployee/${emp._id}`}
                              className="p-2 text-gray-500 hover:text-primary rounded-md"
                              title="Edit Employee"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </Link>

                            {/* DELETE BUTTON */}
                            <button
                              onClick={() => deleteEmployee(emp._id)}
                              className="p-2 text-gray-500 hover:text-red-500 rounded-md"
                              title="Delete Employee"
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-600 px-4 py-3">
                <p className="text-sm text-gray-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-600 rounded-md disabled:opacity-50 hover:bg-gray-800"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-gray-600 rounded-md disabled:opacity-50 hover:bg-gray-800"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QR CODE MODAL */}
        {showQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full text-center">
              <h3 className="text-lg font-bold mb-4 text-white">{showQR.fullName || showQR.name}'s QR Code</h3>
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <QRCodeCanvas
                  // use the employee's unique _id so the public page reliably resolves the profile
                  value={`${window.location.origin}/p/${showQR._id}`}
                  size={200}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Scan to view public profile</p>
              <button
                onClick={closeQRModal}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
  );
};

export default AllEmployees;
