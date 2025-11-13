// src/pages/Employees.jsx
import React from 'react';
import AllEmployees from '../components/AllEmployees'; // Adjust path if needed
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react'; // npm install qrcode.react
import { MaterialSymbols } from './MaterialSymbols'; // Optional: if you want custom icon component

const AllEmployees = () => {
  // STATE MANAGEMENT
  const [employees, setEmployees] = useState([]);           // All employees from DB
  const [filteredEmployees, setFilteredEmployees] = useState([]); // After search/filter
  const [loading, setLoading] = useState(true);             // Loading state
  const [error, setError] = useState(null);                 // Error handling
  const [searchTerm, setSearchTerm] = useState('');         // Search input
  const [statusFilter, setStatusFilter] = useState('All');  // Status dropdown
  const [currentPage, setCurrentPage] = useState(1);        // Pagination
  const [showQR, setShowQR] = useState(null);               // QR modal state
  const employeesPerPage = 5;                               // 5 per page like your HTML

  // FETCH EMPLOYEES FROM BACKEND (replace with your API URL)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://smartpass-api.onrender.com/api/employees'); // YOUR API
        setEmployees(response.data);
        setFilteredEmployees(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load employees. Please try again.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchEmployees();
  }, []);

  // FILTER & SEARCH LOGIC
  useEffect(() => {
    let filtered = employees;

    // Search by name or ID
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page on filter
  }, [searchTerm, statusFilter, employees]);

  // PAGINATION LOGIC
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  // GENERATE QR CODE (opens modal)
  const handleGenerateQR = (employee) => {
    setShowQR(employee);
  };

  // CLOSE QR MODAL
  const closeQRModal = () => {
    setShowQR(null);
  };

  // RENDER LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-500">Loading employees...</div>
      </div>
    );
  }

  // RENDER ERROR
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="layout-content-container mx-auto flex max-w-7xl flex-col flex-1">
      {/* HEADER: Title + Add Button */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
            Employee Management
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
            Manage employee QR codes and public information pages.
          </p>
        </div>
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90">
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="truncate">Add New Employee</span>
        </button>
      </div>

      {/* SEARCH + FILTER BAR */}
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">search</span>
          <input
            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
            placeholder="Search by name or ID..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 dark:text-slate-300" htmlFor="status-filter">Status:</label>
            <select
              className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <button className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      {/* EMPLOYEES TABLE */}
      <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="p-4 text-left w-12"><input className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-primary/50 focus:ring-offset-0 dark:ring-offset-slate-900" type="checkbox" /></th>
              <th className="px-4 py-3 text-left text-slate-600 dark:text-slate-300 text-sm font-medium leading-normal whitespace-nowrap">Employee Name</th>
              <th className="px-4 py-3 text-left text-slate-600 dark:text-slate-300 text-sm font-medium leading-normal whitespace-nowrap">Employee ID</th>
              <th className="px-4 py-3 text-left text-slate-600 dark:text-slate-300 text-sm font-medium leading-normal whitespace-nowrap">Email</th>
              <th className="px-4 py-3 text-left text-slate-600 dark:text-slate-300 text-sm font-medium leading-normal whitespace-nowrap">Company</th>
              <th className="px-4 py-3 text-left text-slate-600 dark:text-slate-300 text-sm font-medium leading-normal whitespace-nowrap">Category</th>
              <th className="px-4 py-3 text-left text-slate-600 dark:text-slate-300 text-sm font-medium leading-normal whitespace-nowrap">QR Code</th>
              <th className="px-4 py-3 text-left text-slate-600 dark:text-slate-300 text-sm font-medium leading-normal whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left text-slate-600 dark:text-slate-300 text-sm font-medium leading-normal whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {currentEmployees.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-slate-500">No employees found.</td>
              </tr>
            ) : (
              currentEmployees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4"><input className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-primary/50 focus:ring-offset-0 dark:ring-offset-slate-900" type="checkbox" /></td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10"
                        style={{ backgroundImage: `url(${emp.avatar || 'https://via.placeholder.com/40'})` }}
                      ></div>
                      <span className="text-slate-900 dark:text-white font-medium">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">{emp.employeeId}</td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">{emp.email}</td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">{emp.company}</td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">{emp.category}</td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap text-center">
                    {emp.qrGenerated ? (
                      <span className="material-symbols-outlined text-2xl text-success">qr_code_2</span>
                    ) : (
                      <span className="text-2xl">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        emp.status === 'Active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex gap-1 items-center">
                      <button
                        onClick={() => handleGenerateQR(emp)}
                        className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                        <span>Generate</span>
                      </button>
                      <button className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button className="p-2 text-slate-500 hover:text-danger dark:text-slate-400 dark:hover:text-danger transition-colors">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center p-4 mt-4">
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center rounded-lg ${
                currentPage === i + 1
                  ? 'text-white bg-primary'
                  : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        </nav>
      </div>

      {/* QR CODE MODAL */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">{showQR.name}'s QR Code</h3>
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCode value={`https://smartpass.com/employee/${showQR.employeeId}`} size={200} />
            </div>
            <p className="text-sm text-slate-500 mt-3">Scan to view public profile</p>
            <button
              onClick={closeQRModal}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEmployees;