import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // npm install recharts

const Reports = () => {
  // === STATE ===
  const [stats, setStats] = useState({
    activeEmployees: 0,
    totalScans: 0,
    newEmployees: 0,
    profileUpdates: 0,
  });
  const [growthData, setGrowthData] = useState([]);        // Line chart data
  const [activityLog, setActivityLog] = useState([]);      // Recent scans
  const [timeFilter, setTimeFilter] = useState('7days');  // Active filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === FETCH DATA FROM YOUR CLOUD API ===
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, growthRes, logRes] = await Promise.all([
          axios.get(`https://smartpass-api.onrender.com/api/reports/stats?filter=${timeFilter}`),
          axios.get(`https://smartpass-api.onrender.com/api/reports/growth?filter=${timeFilter}`),
          axios.get(`https://smartpass-api.onrender.com/api/reports/activity?filter=${timeFilter}&limit=5`)
        ]);

        setStats(statsRes.data);
        setGrowthData(growthRes.data);
        setActivityLog(logRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load reports. Please try again.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchReports();
  }, [timeFilter]);

  // === TIME FILTER BUTTONS ===
  const filters = [
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'custom', label: 'Custom Range' },
  ];

  // === RENDER LOADING ===
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-slate-500">Loading analytics...</p>
      </div>
    );
  }

  // === RENDER ERROR ===
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* === SIDEBAR (Keep your existing Sidebar or paste here) === */}
      <nav className="w-64 shrink-0 bg-white dark:bg-background-dark p-4 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXC1TrfdP3aPWLmNT_zvSw2-F-ZpoLyj71W-Q7Ld3UXwQ3jnGFaCmELR4t8prKheh77LiEccTn2BgsGDw_nSIYiVKyQeUkFxXrt-I0CwHXF5zn9JigSuaE2uRnQ6VzMa6JKd5iN2mtUBd0Q8twytdClkWa_IyxXXlCVdl_jeq2cYdRvgZEpaoSepB2Z_2i9hAy93BFz5nsM2QsEiigFmDA98xzV9MaKU1-Px-PyuuV66hTISKhYzrOwLJBfvpwYonRaTCguJuLAuTk')" }}></div>
            <div>
              <h1 className="text-slate-900 dark:text-white text-base font-medium">SmartPass</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Admin Panel</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {/* NAV ITEMS */}
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <span className="material-symbols-outlined text-slate-900">dashboard</span>
              <p className="text-slate-900 text-sm font-medium">Dashboard</p>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10">
              <span className="material-symbols-outlined text-primary">bar_chart</span>
              <p className="text-primary text-sm font-medium">Reports</p>
            </a>
            {/* Add other links */}
          </div>
        </div>
      </nav>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-6 lg:p-10">
        <div className="layout-content-container flex flex-col gap-6 max-w-7xl mx-auto">

          {/* TITLE + EXPORT */}
          <div className="flex flex-wrap justify-between gap-4 items-start">
            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-[-0.033em]">
                Analytics & Reports
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base">
                View analytical data and insights related to employee management and system usage.
              </p>
            </div>
            <button className="flex items-center gap-2 h-10 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90">
              <span className="material-symbols-outlined">download</span>
              <span>Export Report</span>
            </button>
          </div>

          {/* TIME FILTERS */}
          <div className="flex gap-2 p-1 overflow-x-auto">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium transition-colors ${
                  timeFilter === filter.id
                    ? 'bg-primary/20 text-primary'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                }`}
              >
                {filter.label}
                {filter.id === 'custom' && <span className="material-symbols-outlined">arrow_drop_down</span>}
              </button>
            ))}
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Active Employees', value: stats.activeEmployees, change: '+2.5%', positive: true },
              { label: 'Total Scans', value: stats.totalScans, change: '+10.1%', positive: true },
              { label: 'New Employees', value: stats.newEmployees, change: '+8.0%', positive: true },
              { label: 'Profile Updates', value: stats.profileUpdates, change: '-1.2%', positive: false },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-900 dark:text-white text-base font-medium">{stat.label}</p>
                <p className="text-slate-900 dark:text-white text-3xl font-bold">{stat.value.toLocaleString()}</p>
                <p className={`text-base font-medium ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* CHARTS + PIE + LOG */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* GROWTH CHART */}
            <div className="lg:col-span-2 flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
              <p className="text-slate-900 dark:text-white text-base font-medium">Employee Growth Trend</p>
              <div className="flex gap-1">
                <p className="text-slate-500 dark:text-slate-400 text-base">Last 30 Days</p>
                <p className="text-green-600 text-base font-medium">+2.5%</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="employees" stroke="#135bec" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PIE CHART */}
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
              <p className="text-slate-900 dark:text-white text-base font-medium">Employee Status Breakdown</p>
              <div className="flex items-center justify-center flex-1 my-4">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="stroke-slate-200 dark:stroke-slate-700"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" strokeWidth="4"
                    />
                    <path
                      className="stroke-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${(stats.activeEmployees / (stats.activeEmployees + (stats.totalEmployees - stats.activeEmployees))) * 100}, 100`}
                      strokeLinecap="round"
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stats.activeEmployees && stats.totalEmployees
                        ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100)
                        : 0}%
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Active</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm text-slate-900 dark:text-white">Active ({stats.activeEmployees})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <span className="text-sm text-slate-900 dark:text-white">Inactive ({stats.totalEmployees - stats.activeEmployees})</span>
                </div>
              </div>
            </div>

            {/* ACTIVITY LOG */}
            <div className="lg:col-span-3 flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
              <p className="text-slate-900 dark:text-white text-base font-medium">Recent Activity Log</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Employee Name</th>
                      <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Department</th>
                      <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Date & Time</th>
                      <th className="p-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog.map((log, i) => (
                      <tr key={i} className="border-b border-slate-200 dark:border-slate-800">
                        <td className="p-3 text-sm text-slate-900 dark:text-white">{log.name}</td>
                        <td className="p-3 text-sm text-slate-500 dark:text-slate-400">{log.department}</td>
                        <td className="p-3 text-sm text-slate-500 dark:text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-1 rounded-full font-medium text-xs ${
                            log.result === 'granted'
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                          }`}>
                            {log.result === 'granted' ? 'Access Granted' : 'Access Denied'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;