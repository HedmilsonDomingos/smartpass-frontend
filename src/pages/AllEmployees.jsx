import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar.jsx';
import Button from '../components/ui/Button.jsx';

// List all employees in a table
export default function AllEmployees() {
  const [employees, setEmployees] = useState([]);

  // Load employees from backend
  useEffect(() => {
    fetch('http://localhost:3000/api/employees', {
      headers: { Authorization: localStorage.getItem('token') }
    })
    .then(res => res.json())
    .then(setEmployees);
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <Link to="/add-employee">
            <Button><span className="material-symbols-outlined">add</span> Add Employee</Button>
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp._id} className="border-t">
                  <td className="px-6 py-4">{emp.name}</td>
                  <td className="px-6 py-4">{emp.employeeId}</td>
                  <td className="px-6 py-4">{emp.department}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Link to={`/edit-employee/${emp._id}`}><Button size="sm" variant="secondary">Edit</Button></Link>
                    <Link to={`/employee-details/${emp._id}`}><Button size="sm" variant="outline">View</Button></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}