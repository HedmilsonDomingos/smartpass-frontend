// src/pages/AddEmployee.jsx
// VALIDAÇÃO ANGOLANA DE AÇO + QR AUTOMÁTICO + NUVEM
// Feito em Luanda, 11 Novembro 2025 - 22:35 WAT

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import api from '../lib/api';

export default function AddEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    cargo: "",
    employeeId: "",
    department: "",
    officeLocation: "",
    company: "",
    status: "",
    idCardExpirationDate: "",
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


    // Telefone angolano - obrigatório começar com 9 e ter 9 dígitos
    if (!form.phone || !/^9[123456789]\d{7}$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Telefone angolano inválido (ex: 923 456 789)";
    }

    // Cargo e departamento obrigatórios
    if (!form.cargo.trim()) newErrors.cargo = "Cargo é obrigatório";
    if (!form.department) newErrors.department = "Departamento é obrigatório";
    if (!form.officeLocation) newErrors.officeLocation = "Localização é obrigatória";
    if (!form.company) newErrors.company = "Empresa é obrigatória";

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

      // Create the employee first (without QR). Backend will return the new record with its _id.
      const { fullName, employeeId, cargo, phone, ...restOfForm } = form;
      const payload = {
        ...restOfForm,
        cargo: form.cargo,
        mobile: phone, // Map frontend 'phone' to backend 'mobile'
        employeeId: finalEmployeeId,
        name: fullName.trim(),
      };

      const res = await api.post("/api/employees", payload);

      if (res.status === 200 || res.status === 201) {
        const created = res.data;

        // Generate a QR that points to the public employee page using the created _id.
        const qrData = `${window.location.origin}/p/${created._id}`;
        const qrImage = await QRCode.toDataURL(qrData, {
          width: 512,
          margin: 2,
          color: { dark: "#135bec", light: "#ffffff" }
        });

        // Update the employee record with the generated QR image
        try {
          await api.put(`/api/employees/${created._id}`, { qrCode: qrImage });
        } catch (err) {
          // Non-fatal: still continue but inform user
          console.warn('Failed to save QR to employee record:', err);
        }

        alert(`FUNCIONÁRIO ADICIONADO COM SUCESSO!\n\nNome: ${form.fullName}\nID: ${finalEmployeeId}\nQR Code gerado e salvo!`);
        navigate("/AllEmployees");
      } else {
        const error = await res.text();
        alert("Erro do servidor: " + error);
      }
    } catch (err) {
      console.error("API Error during employee creation:", err);
      const errorMessage = err.response?.data?.message || err.message || "Erro desconhecido ao conectar ao servidor.";
      alert(`Erro ao salvar funcionário: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen text-white">

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-primary">ADICIONAR FUNCIONÁRIO</h1>
            <p className="text-gray-400 mt-2">Sistema com validação angolana de aço</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-700 rounded-2xl border border-gray-600 p-8 space-y-10">

            {/* PERSONAL INFORMATION */}
            <div>
              <h3 className="text-xl font-bold pb-4 border-b border-gray-600">Informação Pessoal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                  <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Nome completo *" className={`w-full h-14 px-5 rounded-xl border ${errors.fullName ? "border-red-500" : "border-gray-600"} bg-gray-800`} />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Email (opcional)" className={`w-full h-14 px-5 rounded-xl border ${errors.email ? "border-red-500" : "border-gray-600"} bg-gray-800`} />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Telefone (+244) *" className={`w-full h-14 px-5 rounded-xl border ${errors.phone ? "border-red-500" : "border-gray-600"} bg-gray-800`} />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
                <h3 className="text-xl font-bold pb-4 border-b border-gray-600">Dados Profissionais</h3>
                <div className="space-y-6 mt-8">
                  <input name="cargo" value={form.cargo} onChange={handleChange} required placeholder="Cargo *" className={`w-full h-14 px-5 rounded-xl border ${errors.cargo ? "border-red-500" : "border-gray-600"} bg-gray-800`} />
                  <select name="department" value={form.department} onChange={handleChange} required className={`w-full h-14 px-5 rounded-xl border ${errors.department ? "border-red-500" : "border-gray-600"} bg-gray-800`}>
                    <option value="">Departamento *</option>
                    <option>Direção Geral</option>
                    <option>Recursos Humanos</option>
                    <option>Tecnologia</option>
                    <option>Segurança</option>
                    <option>Financeiro</option>
                    <option>Operações</option>
                  </select>
                  <select name="company" value={form.company} onChange={handleChange} required className={`w-full h-14 px-5 rounded-xl border ${errors.company ? "border-red-500" : "border-gray-600"} bg-gray-800`}>
                    <option value="">Empresa *</option>
                    <option>Gesglobal</option>
                    <option>Rikauto</option>
                    <option>Abricome</option>
                  </select>
                  <input name="officeLocation" value={form.officeLocation} onChange={handleChange} required placeholder="Office Location *" className={`w-full h-14 px-5 rounded-xl border ${errors.officeLocation ? "border-red-500" : "border-gray-600"} bg-gray-800`} />
                  <input name="idCardExpirationDate" value={form.idCardExpirationDate} onChange={handleChange} type="date" placeholder="Data de Expiração do Cartão ID" className={`w-full h-14 px-5 rounded-xl border border-gray-600 bg-gray-800`} />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold pb-4 border-b border-gray-600">Estado da Conta</h3>
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
            <div className="flex justify-end pt-8 border-t border-gray-600">
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
