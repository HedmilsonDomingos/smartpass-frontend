// src/pages/AddEmployee.jsx
// VALIDAÇÃO ANGOLANA DE AÇO + QR AUTOMÁTICO + NUVEM
// Feito em Luanda, 11 Novembro 2025 - 22:35 WAT

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";

export default function AddEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    mobileNumber: "",
    jobTitle: "",
    employeeId: "",
    department: "",
    officeLocation: "",
    company: "SmartPass Angola",
    category: "",
    status: "Active",
    photo: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpa erro quando o usuário começa a corrigir
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validação de tamanho (máx 3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert("Foto muito grande! Máximo 3MB.");
      return;
    }

    // Validação de tipo
    if (!file.type.startsWith("image/")) {
      alert("Por favor seleciona uma imagem válida.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, photo: reader.result });
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const toggleStatus = () => {
    setForm({ ...form, status: form.status === "Active" ? "Inactive" : "Active" });
  };

  // VALIDAÇÃO ANGOLANA DE AÇO
  const validateForm = () => {
    const newErrors = {};

    // Nome completo - mínimo 6 caracteres, só letras e espaços
    if (!form.fullName.trim()) {
      newErrors.fullName = "Nome completo é obrigatório";
    } else if (form.fullName.trim().length < 6) {
      newErrors.fullName = "Nome muito curto (mínimo 6 caracteres)";
    } else if (!/^[a-zA-ZÀ-ú\s]+$/.test(form.fullName.trim())) {
      newErrors.fullName = "Nome só pode ter letras e espaços";
    }

    // Email - opcional, mas se preenchido tem que ser válido
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    // Telemóvel angolano - obrigatório começar com 9 e ter 9 dígitos
    if (form.mobileNumber && !/^9[123456789]\d{7}$/.test(form.mobileNumber.replace(/\s/g, ""))) {
      newErrors.mobileNumber = "Telemóvel angolano inválido (ex: 923 456 789)";
    }

    // Cargo e departamento obrigatórios
    if (!form.jobTitle.trim()) newErrors.jobTitle = "Cargo é obrigatório";
    if (!form.department) newErrors.department = "Departamento é obrigatório";
    if (!form.category) newErrors.category = "Categoria é obrigatória";
    if (!form.officeLocation) newErrors.officeLocation = "Localização é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Corrige os erros antes de salvar!");
      return;
    }

    setLoading(true);

    try {
      const finalEmployeeId = form.employeeId || "SP" + Date.now().toString().slice(-6);
      const qrData = `https://smartpass-angola.com/verify/${finalEmployeeId}`;
      const qrImage = await QRCode.toDataURL(qrData, { 
        width: 512, 
        margin: 2,
        color: { dark: "#135bec", light: "#ffffff" }
      });

      const payload = {
        ...form,
        employeeId: finalEmployeeId,
        qrCode: qrImage,
        name: form.fullName.trim(),
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
        alert(`FUNCIONÁRIO ADICIONADO COM SUCESSO!\n\nNome: ${form.fullName}\nID: ${finalEmployeeId}\nQR Code gerado e salvo!`);
        navigate("/employees");
      } else {
        const error = await res.text();
        alert("Erro do servidor: " + error);
      }
    } catch (err) {
      alert("Sem conexão com a nuvem. Verifica a internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      {/* SIDEBAR (mesmo do anterior) */}
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

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-primary">ADICIONAR FUNCIONÁRIO</h1>
            <p className="text-subtext-light dark:text-subtext-dark mt-2">Sistema com validação angolana de aço</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-container-light dark:bg-container-dark rounded-2xl border border-border-light dark:border-border-dark p-8 space-y-10">

            {/* PERSONAL INFORMATION */}
            <div>
              <h3 className="text-xl font-bold pb-4 border-b border-border-light dark:border-border-dark">Informação Pessoal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                  <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Nome completo *" className={`w-full h-14 px-5 rounded-xl border ${errors.fullName ? "border-red-500" : "border-border-light dark:border-border-dark"} bg-background-light dark:bg-background-dark`} />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Email (opcional)" className={`w-full h-14 px-5 rounded-xl border ${errors.email ? "border-red-500" : "border-border-light dark:border-border-dark"} bg-background-light dark:bg-background-dark`} />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} placeholder="Telemóvel (+244) *" className={`w-full h-14 px-5 rounded-xl border ${errors.mobileNumber ? "border-red-500" : "border-border-light dark:border-border-dark"} bg-background-light dark:bg-background-dark`} />
                  {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm font-bold mb-3">Foto do funcionário (máx 3MB)</p>
                  <div className="flex items-center gap-6">
                    <div className="size-28 rounded-2xl bg-gray-200 border-4 border-dashed overflow-hidden">
                      {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">Foto</div>}
                    </div>
                    <label className="cursor-pointer bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary/90">
                      Selecionar Foto
                      <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* PROFESSIONAL DETAILS + STATUS */}
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl font-bold pb-4 border-b border-border-light dark:border-border-dark">Dados Profissionais</h3>
                <div className="space-y-6 mt-8">
                  <input name="jobTitle" value={form.jobTitle} onChange={handleChange} required placeholder="Cargo *" className={`w-full h-14 px-5 rounded-xl border ${errors.jobTitle ? "border-red-500" : "border-border-light"} bg-background-light dark:bg-background-dark`} />
                  <select name="department" value={form.department} onChange={handleChange} required className={`w-full h-14 px-5 rounded-xl border ${errors.department ? "border-red-500" : "border-border-light"} bg-background-light dark:bg-background-dark`}>
                    <option value="">Departamento *</option>
                    <option>Direção Geral</option>
                    <option>Recursos Humanos</option>
                    <option>Tecnologia</option>
                    <option>Segurança</option>
                    <option>Financeiro</option>
                    <option>Operações</option>
                  </select>
                  <select name="category" value={form.category} onChange={handleChange} required className={`w-full h-14 px-5 rounded-xl border ${errors.category ? "border-red-500" : "border-border-light"} bg-background-light dark:bg-background-dark`}>
                    <option value="">Categoria *</option>
                    <option>Full-Time</option>
                    <option>Part-Time</option>
                    <option>Estagiário</option>
                    <option>Consultor</option>
                  </select>
                  <select name="officeLocation" value={form.officeLocation} onChange={handleChange} required className={`w-full h-14 px-5 rounded-xl border ${errors.officeLocation ? "border-red-500" : "border-border-light"} bg-background-light dark:bg-background-dark`}>
                    <option value="">Localização *</option>
                    <option>Luanda - Talatona</option>
                    <option>Luanda - Centro</option>
                    <option>Viana</option>
                    <option>Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold pb-4 border-b border-border-light dark:border-border-dark">Estado da Conta</h3>
                <div className="mt-8 flex items-center gap-6">
                  <span className={form.status === "Inactive" ? "text-red-500 font-bold" : "text-gray-500"}>Inativo</span>
                  <button type="button" onClick={toggleStatus} className={`relative inline-flex h-8 w-14 rounded-full transition ${form.status === "Active" ? "bg-primary" : "bg-gray-400"}`}>
                    <span className={`inline-block h-7 w-7 rounded-full bg-white transform transition ${form.status === "Active" ? "translate-x-7" : "translate-x-0.5"}`} />
                  </button>
                  <span className={form.status === "Active" ? "text-primary font-bold" : "text-gray-500"}>Ativo</span>
                </div>
              </div>
            </div>

            {/* BOTÃO FINAL */}
            <div className="flex justify-end pt-8 border-t border-border-light dark:border-border-dark">
              <button type="submit" disabled={loading} className="h-16 px-12 bg-primary text-white text-xl font-black rounded-xl hover:bg-primary/90 disabled:opacity-70 flex items-center gap-3 shadow-2xl">
                <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                {loading ? "A GUARDAR NA NUVEM..." : "SALVAR + GERAR QR CODE"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}