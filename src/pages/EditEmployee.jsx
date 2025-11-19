import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import axios from 'axios';
import { downloadImageFromDataUrl } from './EditEmployeeQRUtils';

const formatDateForInput = (isoString) => {
  if (!isoString) return '';
  try {
    return new Date(isoString).toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

const EditEmployee = () => {
  const { id } = useParams(); // Get employee ID from URL
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  // === EMPLOYEE DATA STATE ===
  const [employee, setEmployee] = useState({
    fullName: '',
    email: '',
    phone: '',
    cargo: '',
    employeeId: '',
    department: '',
    company: '',
    officeLocation: '',
    status: 'Active',
    profilePic: '',
    qrCode: '',
    idCardExpiresAt: '', // ID Card expiration date
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // === FETCH EMPLOYEE FROM DATABASE ===
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await api.get(`/api/employees/${id}`);

        const backendData = res.data;
        setEmployee({
          // Map backend fields to frontend state names
          fullName: backendData.name || '',
          email: backendData.email || '',
          phone: backendData.mobile || '',
          cargo: backendData.cargo || '',
          employeeId: backendData.employeeId || '',
          department: backendData.department || '',
          company: backendData.company || '',
          officeLocation: backendData.officeLocation || '',
          status: backendData.status || 'Active',
          profilePic: backendData.photo || backendData.profilePic || '', // Assuming backend uses 'photo'
          qrCode: backendData.qrCode || '',
          idCardExpiresAt: formatDateForInput(backendData.idCardExpirationDate) || '',
        });
        setLoading(false);
      } catch (err) {
        setMessage({ text: 'Employee not found.', type: 'error' });
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, token, navigate]);

  // === HANDLE INPUT CHANGE ===
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmployee(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Toggle status between Active/Inactive
  const toggleStatus = () => {
    setEmployee(prev => ({
      ...prev,
      status: prev.status === 'Active' ? 'Inactive' : 'Active',
    }));
  };

  // === HANDLE PROFILE PICTURE UPLOAD ===
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const res = await api.post(
        `/api/employees/${id}/upload-photo`,
        formData
      );

      setEmployee(prev => ({ ...prev, profilePic: res.data.profilePic }));
      setMessage({ text: 'Profile picture updated!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to upload image.', type: 'error' });
    }
  };

  // === REGENERATE QR CODE ===
  const regenerateQR = async () => {
    setRegenerating(true);
    try {
      const res = await api.post(
        `/api/employees/${id}/regenerate-qr`,
        {}
      );

      setEmployee(prev => ({ ...prev, qrCode: res.data.qrCode }));
      setMessage({ text: 'QR Code regenerated!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to regenerate QR.', type: 'error' });
    } finally {
      setRegenerating(false);
    }
  };

  // === SAVE CHANGES ===
  const handleSave = async () => {
    setSaving(true);
    try {
      if (!window.confirm("Are you sure you want to save these changes?")) {
        setSaving(false);
        return;
      }

      const { fullName, phone, idCardExpiresAt, ...restOfEmployee } = employee;
      
      // Map frontend state names to backend model names
      const payload = {
        ...restOfEmployee,
        mobile: phone, // Map frontend 'phone' to backend 'mobile'
        name: fullName.trim(),
        // Send null if the date input is empty, otherwise send the date string
        idCardExpirationDate: idCardExpiresAt ? idCardExpiresAt : null,
      };

      await api.put(
        `/api/employees/${id}`,
        payload
      );

      setMessage({ text: 'Employee updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };
  // === DOWNLOAD QR CODE ===
  const downloadQR = () => {
    if (employee.qrCode) {
      downloadImageFromDataUrl(employee.qrCode, `qr-${employee.employeeId}.png`);
    } else {
      setMessage({ text: 'QR Code not available for download.', type: 'error' });
    }
  };


  if (loading) {
    return <div className="p-12 text-center text-lg">Loading employee...</div>;
  }

  return (
    <div className="flex min-h-screen text-white">
      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex flex-wrap gap-2 mb-6">
            <a href="/employees" className="text-gray-400 hover:underline">All Employees</a>
            <span className="text-gray-400">/</span>
            <span className="text-white">Edit Employee</span>
          </div>

          {/* Title */}
          <div className="flex flex-wrap justify-between gap-3 mb-8">
            <div>
              <p className="text-4xl font-black tracking-tight">Edit Employee: {employee.fullName}</p>
              <p className="text-gray-400 mt-2">Update the employee's information and QR code as needed.</p>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT: FORM */}
            <div className="lg:col-span-2 bg-gray-700 p-6 rounded-xl border border-gray-600">
              <h2 className="text-[22px] font-bold pb-5 border-b border-gray-600">
                Employee Information
              </h2>

              <div className="flex flex-col md:flex-row gap-6 items-start mt-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div
                      className="w-24 h-24 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${employee.profilePic || 'https://via.placeholder.com/96'})` }}
                    ></div>
                    <label className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 bg-primary rounded-full text-white cursor-pointer hover:bg-primary/90">
                      <span className="material-symbols-outlined text-base">edit</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <p className="text-sm text-gray-400">Profile Picture</p>
                </div>

                {/* Form Fields (consistent with AddEmployee) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 w-full">
                  <label className="flex flex-col">
                    <p className="text-base font-medium pb-2">Full Name</p>
                    <input name="fullName" value={employee.fullName} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-primary" />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-base font-medium pb-2">Email Address</p>
                    <input name="email" value={employee.email} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-primary" />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-base font-medium pb-2">Employee ID</p>
                    <input name="employeeId" value={employee.employeeId} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-primary" />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-base font-medium pb-2">Telefone</p>
                    <input name="phone" value={employee.phone} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-primary" />
                  </label>
                  <label className="flex flex-col sm:col-span-2">
                    <p className="text-base font-medium pb-2">Cargo</p>
                    <input name="cargo" value={employee.cargo} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-primary" />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-base font-medium pb-2">Department</p>
                    <select name="department" value={employee.department} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-primary">
                      <option value="">Departamento *</option>
                      <option>Direção Geral</option>
                      <option>Recursos Humanos</option>
                      <option>Tecnologia</option>
                      <option>Segurança</option>
                      <option>Financeiro</option>
                      <option>Operações</option>
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <p className="text-base font-medium pb-2">Empresa</p>
                    <select name="company" value={employee.company} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-primary">
                    <option value="">Empresa *</option>
                      <option>Gesglobal</option>
                      <option>Rikauto</option>
                      <option>Abricome</option>
                    </select>
                  </label>
                  <label className="flex flex-col sm:col-span-2">
                    <p className="text-base font-medium pb-2">Office Location</p>
                    <input name="officeLocation" value={employee.officeLocation} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-primary" />
                  </label>
                  <label className="flex flex-col sm:col-span-2">
                    <p className="text-base font-medium pb-2">ID Card Expiration Date</p>
                    <input name="idCardExpiresAt" type="date" value={employee.idCardExpiresAt} onChange={handleChange}
                      className="h-14 px-4 rounded-lg border border-gray-600 bg-gray-800 text-white focus:border-primary" />
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT: STATUS + QR */}
            <div className="flex flex-col gap-8">
              {/* Status Toggle (consistent with AddEmployee) */}
              <div className="bg-gray-700 p-6 rounded-xl border border-gray-600">
                <h3 className="text-xl font-bold pb-4 border-b border-gray-600">Estado da Conta</h3>
                <div className="mt-8 flex items-center gap-6">
                  <span className={employee.status === "Inactive" ? "text-red-500 font-bold" : "text-gray-500"}>Inativo</span>
                  <button type="button" onClick={toggleStatus} className={`relative inline-flex h-8 w-14 rounded-full transition ${employee.status === "Active" ? "bg-primary" : "bg-gray-400"}`}>
                    <span className={`inline-block h-7 w-7 rounded-full bg-white transform transition ${employee.status === "Active" ? "translate-x-7" : "translate-x-0.5"}`} />
                  </button>
                  <span className={employee.status === "Active" ? "text-primary font-bold" : "text-gray-500"}>Ativo</span>
                </div>
              </div>

              {/* QR Code (consistent with AddEmployee, with download) */}
              <div className="bg-gray-700 p-6 rounded-xl border border-gray-600 text-center">
                <h3 className="text-lg font-bold mb-4">Employee QR Code</h3>
                <div className="flex justify-center p-4 bg-gray-800 rounded-lg">
                  <img src={employee.qrCode} alt="QR Code" className="w-40 h-40" />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={regenerateQR}
                    disabled={regenerating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                    {regenerating ? 'Regenerating...' : 'Regenerate QR Code'}
                  </button>
                  <button
                    onClick={downloadQR}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Download QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SAVE BUTTONS */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => navigate('/employees')}
              className="h-12 px-6 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-12 px-6 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditEmployee;
