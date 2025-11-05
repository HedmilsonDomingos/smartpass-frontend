import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Public page - no login, shown when QR is scanned
export default function PublicEmployeePage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/public-employee/${id}`)
      .then(res => res.json())
      .then(setEmployee);
  }, [id]);

  if (!employee) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <img src={employee.photo} alt="" className="w-32 h-32 rounded-full mx-auto mb-4" />
        <h1 className="text-2xl font-bold">{employee.name}</h1>
        <p className="text-primary">{employee.position}</p>
        <p className="mt-4">Department: {employee.department}</p>
        <p>Status: <span className="text-green-600 font-semibold">{employee.status}</span></p>
      </div>
    </div>
  );
}