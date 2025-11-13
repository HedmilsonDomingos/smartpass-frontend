import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Sidebar from '../components/ui/Sidebar.jsx';

const RecentActivityLog = () => {
  const token = localStorage.getItem('authToken');

  // === STATE ===
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  // === FETCH LOGS FROM DATABASE ===
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('https://smartpass-api.onrender.com/api/activity', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page,
            limit,
            search,
            action: actionFilter !== 'All' ? actionFilter : undefined,
            dateRange: dateFilter,
          },
        });

        setLogs(res.data.logs);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load activity log:', err);
        setLoading(false);
      }
    };

    if (token) fetchLogs();
  }, [token, page, search, actionFilter, dateFilter]);

  // === EXPORT LOGS TO CSV ===
  const exportLogs = async () => {
    try {
      const res = await axios.get('https://smartpass-api.onrender.com/api/activity/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SmartPass_Activity_Log_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export log.');
    }
  };

  // === ACTION BADGE STYLING ===
  const getActionBadge = (action) => {
    if (action.includes('Created') || action.includes('Logged In') || action.includes('Scanned'))
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    if (action.includes('Deleted'))
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
    if (action.includes('Updated'))
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h1 className="text-4xl font-black text-[#1F2937] dark:text-white">Recent Activity Log</h1>
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 h-10 px-4 bg-[#E5E7EB] dark:bg-gray-700 rounded-lg font-bold text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Export Log
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E5E7EB] dark:border-gray-700 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <div className="flex h-12 rounded-lg bg-background-light dark:bg-background-dark">
                  <div className="flex items-center pl-4 text-[#616f89] dark:text-gray-400">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by employee name or user..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 bg-transparent outline-none text-base"
                  />
                </div>
              </div>

              <button className="flex h-12 items-center justify-between px-4 rounded-lg bg-background-light dark:bg-background-dark border border-transparent hover:border-gray-300 dark:hover:border-gray-600">
                <span className="text-sm font-medium">Action Type: {actionFilter}</span>
                <span className="material-symbols-outlined text-2xl">arrow_drop_down</span>
              </button>

              <button className="flex h-12 items-center justify-between px-4 rounded-lg bg-background-light dark:bg-background-dark border border-transparent hover:border-gray-300 dark:hover:border-gray-600">
                <span className="text-sm font-medium">Date Range: {dateFilter}</span>
                <span className="material-symbols-outlined text-2xl">arrow_drop_down</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-background-light dark:bg-background-dark">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-[#1F2937] dark:text-gray-300">Employee/User</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-[#1F2937] dark:text-gray-300">Action</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-[#1F2937] dark:text-gray-300">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-gray-700">
                  {loading ? (
                    <tr><td colSpan="3" className="text-center py-10">Loading logs...</td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-10 text-gray-500">No activity found.</td></tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-background-light dark:hover:bg-background-dark/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={log.user?.profilePic || 'https://via.placeholder.com/32'}
                              alt={log.user?.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-sm font-medium">{log.user?.name || 'Unknown User'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#616f89] dark:text-gray-400">
                          {format(new Date(log.createdAt), 'MMMM d, yyyy, h:mm a')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span> Previous
            </button>

            <div className="hidden md:flex items-center gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${page === i + 1 ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {i + 1}
                </button>
              ))}
              {totalPages > 5 && <span className="text-sm text-[#616f89] dark:text-gray-400">...</span>}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecentActivityLog;