import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from '../components/ui/Sidebar.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

// Edit existing employee
export default function EditEmployee() {
  const { id } = useParams(); // Get employee ID from URL
  const [employee, setEmployee] = useState({});
  const navigate = useNavigate();

  // Load employee data
  useEffect(() => {
    fetch(`http://localhost:5000/api/employees/${id}`, {
      headers: { Authorization: localStorage.getItem('token') }
    })
    .then(res => res.json())
    .then(setEmployee);
  }, [id]);

  // Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:3000/api/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token')
      },
      body: JSON.stringify(employee)
    });
    navigate('/employees');
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Employee</h1>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl space-y-6">
          <Input label="Name" value={employee.name || ''} onChange={e => setEmployee({...employee, name: e.target.value})} />
          <Input label="Email" value={employee.email || ''} onChange={e => setEmployee({...employee, email: e.target.value})} />
          {/* Add more fields as needed */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate('/employees')}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </main>
    </div>
  );
}