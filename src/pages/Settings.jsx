// src/pages/Settings.jsx
import { useState } from 'react';
import Sidebar from '../components/ui/Sidebar.jsx';
import Switch from '../components/ui/Switch.jsx';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl space-y-4 max-w-md">
          <Switch label="Dark Mode" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
          <Switch label="Email Notifications" />
        </div>
      </main>
    </div>
  );
}