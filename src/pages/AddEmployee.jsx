// src/pages/AddEmployee.jsx
// ADICIONAR FUNCIONÁRIO COMPLETO + FOTO + QR AUTOMÁTICO
// 100% CONECTADO À NUVEM - Feito com orgulho em Luanda, Angola - 11 Nov 2025

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode"; // Gera QR Code em imagem (data URL)

export default function AddEmployee() {
  const navigate = useNavigate();

  // Estado com TODOS os campos do teu HTML
  const [form, setForm] = useState({
    fullName: "",
    email: "",            // opcional
    phoneNumber: "",
    mobileNumber: "",
    jobTitle: "",
    employeeId: "",       // opcional (gerado automaticamente se vazio)
    department: "",
    officeLocation: "",
    company: "Rikauto Angola",
    category: "",
    status: "Active",     // toggle Active/Inactive
    photo: "",            // foto em base64
  });

  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Atualiza os inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Upload de foto com preview
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, photo: reader.result });
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Toggle Active/Inactive
  const toggleStatus = () => {
    setForm({ ...form, status: form.status === "Active" ? "Inactive" : "Active" });
  };

  // SUBMIT — ENVIA PARA A NUVEM + GERA QR CODE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.jobTitle || !form.department || !form.category) {
      alert("Preenche os campos obrigatórios: Nome, Cargo, Departamento e Categoria");
      return;
    }

    setLoading(true);

    try {
      // Gera Employee ID automático se estiver vazio
      const finalEmployeeId = form.employeeId || "SP" + Date.now().toString().slice(-6);

      // Gera QR Code com link de verificação
      const qrData = `https://smartpass-angola.com/verify/${finalEmployeeId}`;
      const qrImage = await QRCode.toDataURL(qrData, { width: 512, color: { dark: "#135bec" } });

      const payload = {
        ...form,
        employeeId: finalEmployeeId,
        qrCode: qrImage,
        name: form.fullName, // compatibilidade com o backend
      };

      const token = localStorage.getItem("token");
      const res = await fetch("https://smartpass-api.onrender.com/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(`Funcionário ${form.fullName} adicionado com sucesso!\nQR Code gerado e salvo!`);
        navigate("/employees");
      } else {
        const error = await res.text();
        alert("Erro ao salvar: " + error);
      }
    } catch (err) {
      console.error(err);
      alert("Sem conexão com a nuvem. Verifica a internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      {/* SIDEBAR (igual ao teu HTML) */}
      <aside className="w-64 flex-shrink-0 bg-container-light dark:bg-container-dark border-r border-border-light dark:border-border-dark">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBEL-M8y_K1i8O8EJAZclExmIfeARz4lUbJESgRz2OqesM-mqXjh6eWKrg57kMJmkpLh0GIIxlb5ZZEcD80BrPpNp98zZHTMmpxfHSWF4CEgdI5lcKAT7MyswEBeCOqho5euBc6yVppHNK9mDZ8uQgUqOyXvPP_AfQKhcOKQ2_5vvUt47HEVVRto1K24ncSnpuTNNhAC-tNXKq5-GrpTnbuLlj3-wx00ilHVN9NGo1z-mzqdqtWAi48BX3A719WMl1k_QhHsfHdee-1')" }}></div>
              <div>
                <h1 className="font-bold">SmartPass</h1>
                <p className="text-sm text-subtext-light dark:text-subtext-dark">Admin Panel</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2 mt-4">
              <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 hover:bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined">dashboard</span>
                <p>Dashboard</p>
              </a>
              <a href="/employees" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-bold">
                <span className="material-symbols-outlined">group</span>
                <p>Employees</p>
              </a>
            </nav>
          </div>

          <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="h-10 rounded-lg bg-primary text-white font-bold">
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Add New Employee</h1>
            <p className="text-subtext-light dark:text-subtext-dark">Preenche os dados abaixo para criar o perfil e gerar o QR Code.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-container-light dark:bg-container-dark rounded-xl border border-border-light dark:border-border-dark p-8 space-y-10">

            {/* PERSONAL INFORMATION */}
            <div>
              <h3 className="text-lg font-bold pb-4 border-b border-border-light dark:border-border-dark">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <input name="fullName" onChange={handleChange} required placeholder="Nome completo" className="h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark" />
                <input name="email" onChange={handleChange} type="email" placeholder="Email (opcional)" className="h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark" />
                <input name="phoneNumber" onChange={handleChange} placeholder="Telefone fixo (opcional)" className="h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark" />
                <input name="mobileNumber" onChange={handleChange} placeholder="Telemóvel (+244)" className="h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark" />

                <div className="md:col-span-2">
                  <p className="text-sm font-medium mb-2">Foto do funcionário</p>
                  <div className="flex items-center gap-4">
                    <div className="size-20 rounded-full bg-gray-200 border-2 border-dashed overflow-hidden">
                      {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full"></div>}
                    </div>
                    <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 rounded-lg font-bold">
                      Upload Foto
                      <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* PROFESSIONAL DETAILS */}
            <div>
              <h3 className="text-lg font-bold pb-4 border-b border-border-light dark:border-border-dark">Professional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <input name="jobTitle" onChange={handleChange} required placeholder="Cargo" className="h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark" />
                <input name="employeeId" onChange={handleChange} placeholder="Employee ID (opcional)" className="h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark" />
                
                <select name="department" onChange={handleChange} required className="h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                  <option value="">Departamento</option>
                  <option>Direção</option>
                  <option>Recursos Humanos</option>
                  <option>TI</option>
                  <option>Financeiro</option>
                  <option>Operações</option>
                  <option>Segurança</option>
                </select>

                <select name="officeLocation" onChange={handleChange} required className="h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                  <option value="">Localização</option>
                  <option>Luanda - Talatona</option>
                  <option>Luanda - Centro</option>
                  <option>Viana</option>
                  <option>Remote</option>
                </select>

                <input name="company" value={form.company} readOnly className="h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-gray-100 dark:bg-gray-800" />

                <select name="category" onChange={handleChange} required className="h-12 px-4 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                  <option value="">Categoria</option>
                  <option>Full-Time</option>
                  <option>Part-Time</option>
                  <option>Estagiário</option>
                  <option>Consultor</option>
                </select>
              </div>
            </div>

            {/* STATUS */}
            <div>
              <h3 className="text-lg font-bold pb-4 border-b border-border-light dark:border-border-dark">Estado da Conta</h3>
              <div className="mt-6 flex items-center gap-4">
                <span className={form.status === "Inactive" ? "font-bold" : ""}>Inativo</span>
                <button type="button" onClick={toggleStatus} className={`relative inline-flex h-6 w-11 rounded-full transition ${form.status === "Active" ? "bg-primary" : "bg-gray-400"}`}>
                  <span className={`inline-block h-5 w-5 rounded-full bg-white transform transition ${form.status === "Active" ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <span className={form.status === "Active" ? "font-bold text-primary" : ""}>Ativo</span>
              </div>
            </div>

            {/* BOTÕES FINAIS */}
            <div className="flex justify-end gap-4 pt-6 border-t border-border-light dark:border-border-dark">
              <button type="button" onClick={() => navigate(-1)} className="h-12 px-6 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-800">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="h-12 px-8 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 flex items-center gap-2 disabled:opacity-70">
                <span className="material-symbols-outlined">qr_code_2</span>
                {loading ? "A GUARDAR E GERAR QR..." : "SALVAR + GERAR QR CODE"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}