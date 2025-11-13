import { Link, useLocation } from 'react-router-dom';

// Navigation menu - appears on all admin pages
const navItems = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/Profile", icon: "person", label: "Profile" },
  { to: "/AllEmployees", icon: "group", label: "Employees" },
  { to: "/users", icon: "manage_accounts", label: "Users" },
  { to: "/activity", icon: "history", label: "Activity Log" },
  { to: "/reports", icon: "analytics", label: "Reports" },
  { to: "/CustomReports", icon: "bar_chart", label: "Custom Reports" },
  { to: "/settings", icon: "settings", label: "Settings" },
];

export default function Sidebar() {
  const location = useLocation(); // Get current URL

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
      {/* Logo + App Name */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary rounded-lg size-10 flex items-center justify-center">
          <span className="material-symbols-outlined text-white">qr_code_scanner</span>
        </div>
        <div>
          <h1 className="font-bold text-lg">SmartPass</h1>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              location.pathname === item.to
                ? "bg-primary/10 text-primary" // Active link style
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}