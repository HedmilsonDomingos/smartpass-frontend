// src/components/layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar.jsx';

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-800">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
