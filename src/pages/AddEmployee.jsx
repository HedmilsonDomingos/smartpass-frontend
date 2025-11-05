import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Button from '../components/ui/Button.jsx';

// Form to add new employee
export default function AddEmployee() {
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', position: '', department: '', category: '', company: '', status: true
  });
  const navigate = useNavigate();

  // Submit form to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token')
      },
      body: JSON.stringify(form)
    });
    navigate('/employees');
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Add New Employee</h1>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <Input label="Work Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <Input label="Mobile" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} />
            <Input label="Position" value={form.position} onChange={e => setForm({...form, position: e.target.value})} />
            <Select label="Department" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Sales</option>
            </Select>
            <Select label="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option>Full-Time</option>
              <option>Part-Time</option>
            </Select>
            <Input label="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate('/employees')}>Cancel</Button>
            <Button type="submit">Save Employee</Button>
          </div>
        </form>
      </main>
    </div>
  );
}