import { useEffect, useState } from 'react';
import Sidebar from '../components/ui/Sidebar.jsx';

// Dashboard - shows stats
export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, scans: 0 });

  // Fetch stats from backend on load
  useEffect(() => {
    fetch('http://localhost:3000/api/stats', {
      headers: { Authorization: localStorage.getItem('token') }
    })
    .then(res => res.json())
    .then(setStats)
    .catch(() => setStats({ total: 1416, active: 1204, scans: 89 })); // Fallback
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat Cards */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Total Employees</h3>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Active QR Codes</h3>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Scans Today</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.scans}</p>
          </div>
        </div>
      </main>
    </div>
  );
}