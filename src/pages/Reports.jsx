// src/pages/Reports.jsx
import Sidebar from '../components/ui/Sidebar.jsx';

export default function Reports() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>
        <p className="text-gray-600">Coming soon...</p>
      </main>
    </div>
  );
}