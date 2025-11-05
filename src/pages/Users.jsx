import { useState } from 'react';
import Sidebar from '../components/ui/Sidebar.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Button from '../components/ui/Button.jsx';

// Add new admin/user
export default function Users() {
  const [form, setForm] = useState({ username: '', password: '', role: 'Viewer' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token')
      },
      body: JSON.stringify(form)
    });
    alert('User added');
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Add System User</h1>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl space-y-6 max-w-md">
          <Input label="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <Select label="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option>Administrator</option>
            <option>Manager</option>
            <option>Viewer</option>
          </Select>
          <Button type="submit" className="w-full">Add User</Button>
        </form>
      </main>
    </div>
  );
}