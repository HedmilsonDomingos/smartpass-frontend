import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from '../components/ui/Sidebar.jsx';

// View full employee profile + QR code
export default function EmployeeDetails() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/employees/${id}`, {
      headers: { Authorization: localStorage.getItem('token') }
    })
    .then(res => res.json())
    .then(setEmployee);
  }, [id]);

  if (!employee) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Employee Details</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
          <div className="flex gap-6">
            <img src={employee.qrCode} alt="QR Code" className="w-40 h-40" />
            <div>
              <h2 className="text-2xl font-bold">{employee.name}</h2>
              <p>{employee.position} • {employee.department}</p>
              <p>Status: <span className="text-green-600">Active</span></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}