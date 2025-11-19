import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
// Utility function to generate a range of dates/months
const getRangeLabels = (range) => {
  const labels = [];
  const today = new Date();
  let current = new Date(today);

  if (range === '7days' || range === '30days') {
    const days = range === '7days' ? 7 : 30;
    current.setDate(today.getDate() - days + 1); // Start date
    for (let i = 0; i < days; i++) {
      labels.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  } else if (range === 'quarter') {
    // Grouped by month (YYYY-MM)
    current.setMonth(today.getMonth() - 2); // Start 3 months ago
    current.setDate(1); // Start at the beginning of the month
    for (let i = 0; i < 3; i++) {
      labels.push(current.toISOString().slice(0, 7)); // YYYY-MM
      current.setMonth(current.getMonth() + 1);
    }
  }
  return labels;
};

// Utility function to process data: calculate cumulative growth and fill missing dates
const processGrowthData = (rawData, range) => {
  if (!rawData || rawData.length === 0) return [];

  const labels = getRangeLabels(range);
  const dataMap = new Map(rawData.map(item => [item.date, item.employees]));
  
  let cumulativeCount = 0;
  
  return labels.map(label => {
    const dailyCount = dataMap.get(label) || 0;
    cumulativeCount += dailyCount;
    
    let formattedLabel;
    if (range === 'quarter') {
      // Format YYYY-MM to Month Year
      const [year, month] = label.split('-');
      formattedLabel = new Date(year, month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
    } else {
      // Format YYYY-MM-DD to Month Day
      formattedLabel = new Date(label).toLocaleString('en-US', { month: 'short', day: 'numeric' });
    }

    return {
      label: formattedLabel,
      count: cumulativeCount,
    };
  });
};

export default function Reports() {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const [stats, setStats] = useState({ totalEmployees: 0, activeEmployees: 0, totalScans: 0, newEmployees: 0, profileUpdates: 0, totalUsers: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return 'N/A'; }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        if (!token) { navigate('/login'); return; }

        const [statsRes, growthRes, activityRes] = await Promise.all([
          api.get('/api/reports/stats', { params: { range: timeRange } }),
          api.get('/api/reports/growth', { params: { range: timeRange } }),
          api.get('/api/reports/activity', { params: { range: timeRange, limit: 10 } }),
        ]);

        setStats(statsRes.data || {});
        setGrowthData(growthRes.data || []);
        setRecentActivity(activityRes.data || []);
      } catch (err) {
        console.error('Reports fetch error:', err);
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [timeRange, token, navigate]);

  const activePercent = stats.totalEmployees ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 0;

  const chartData = processGrowthData(growthData, timeRange);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-gray-100 dark:bg-black font-['Inter']">
      <div className="flex h-full flex-1">
        <main className="flex flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-8">
            <div className="text-2xl font-bold text-blue-600">SmartPass</div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://ui-avatars.com/api/?name=Admin')" }}></div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Administrator</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">admin@smartpass.ao</p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics & Reports</p>
                  <p className="text-base text-gray-500 dark:text-gray-400">Overview of system usage and employee activity.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setTimeRange('7days')} className={`h-10 px-4 rounded-lg text-gray-800 dark:text-white ${timeRange === '7days' ? 'bg-blue-600 text-white dark:bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'}`}>7d</button>
                  <button onClick={() => setTimeRange('30days')} className={`h-10 px-4 rounded-lg text-gray-800 dark:text-white ${timeRange === '30days' ? 'bg-blue-600 text-white dark:bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'}`}>30d</button>
                  <button onClick={() => setTimeRange('quarter')} className={`h-10 px-4 rounded-lg text-gray-800 dark:text-white ${timeRange === 'quarter' ? 'bg-blue-600 text-white dark:bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'}`}>Quarter</button>
                  <button onClick={() => setTimeRange('custom')} className={`h-10 px-4 rounded-lg text-gray-800 dark:text-white ${timeRange === 'custom' ? 'bg-blue-600 text-white dark:bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'}`}>Custom</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
                  <p className="text-base font-medium text-gray-900 dark:text-gray-300">Total Employees</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalEmployees || 0}</p>
                </div>
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
                  <p className="text-base font-medium text-gray-900 dark:text-gray-300">Active Employees</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeEmployees || 0}</p>
                </div>
                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
                  <p className="text-base font-medium text-gray-900 dark:text-gray-300">Total Users</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalUsers || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
                  <p className="text-base font-medium mb-2">Employee Growth Trend</p>
                  <div className="h-64">
                    {chartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No growth data available for this period.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="label" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" allowDecimals={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', color: '#F9FAFB' }}
                            labelStyle={{ color: '#F9FAFB' }}
                            formatter={(value) => [`${value} Employees`, 'Cumulative Count']}
                          />
                          <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
                  <p className="text-base font-medium mb-2">Employee Status</p>
                  <div className="flex items-center justify-center h-48">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="stroke-gray-200 dark:stroke-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="4" />
                        <path className="stroke-blue-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${(activePercent/100)*100},100`} strokeLinecap="round" strokeWidth="4" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{activePercent}%</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
                <p className="text-base font-medium mb-4">Recent Activity Log</p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">User</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">Action</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.length > 0 ? recentActivity.map((r, i) => (
                        <tr key={i} className="border-b border-gray-200 dark:border-gray-800">
                          <td className="px-6 py-3 text-gray-800 dark:text-white">{r.user || r.name || 'System'}</td>
                          <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{r.action || '—'}</td>
                          <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{formatDate(r.timestamp)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No activity found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
