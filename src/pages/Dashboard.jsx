// src/pages/Dashboard.jsx
// DASHBOARD PREMIUM + DADOS REAIS DA NUVEM (MongoDB Atlas via Render.com)
// Feito com orgulho em Luanda, Angola - 11 Novembro 2025

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns"; // Para formatar datas (opcional, mas bonito)

export default function Dashboard() {
  // ESTADOS PARA GUARDAR DADOS REAIS DA BASE DE DADOS
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    qrGenerated: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true); // Mostra "carregando" enquanto busca dados
  const navigate = useNavigate();

  // BUSCA DADOS REAIS DA NUVEM ASSIM QUE A PÁGINA ABRE
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token"); // Token real do login
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("https://smartpass-api.onrender.com/api/employees", {
          headers: {
            "Authorization": `Bearer ${token}`, // Autenticação real
          },
        });

        if (res.ok) {
          const employees = await res.json();

          const total = employees.length;
          const active = employees.filter(emp => emp.status === "Active").length;
          const qrGenerated = employees.filter(emp => emp.qrCode).length; // Conta quem tem QR

          // Últimas 5 atividades (ordenadas por data de criação)
          const recent = employees
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(emp => ({
              name: emp.name,
              action: emp.qrCode ? "QR Code Generated" : "New Employee Added",
              date: format(new Date(emp.createdAt), "d MMM yyyy, HH:mm"),
              photo: emp.photo || "https://via.placeholder.com/32", // Foto ou placeholder
            }));

          setStats({
            totalEmployees: total,
            activeEmployees: active,
            qrGenerated,
            recentActivity: recent,
          });
        }
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        alert("Erro ao conectar com a nuvem. Verifica a internet.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // FUNÇÃO PARA IR PARA ADD EMPLOYEE
  const goToAddEmployee = () => navigate("/add-employee");

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-['Inter']">
      <div className="flex h-full flex-1">

        {/* SIDEBAR (MENU LATERAL) */}
        <aside className="flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark/50">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                  <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                </div>
                <div>
                  <h1 className="text-base font-bold text-[#111318] dark:text-gray-200">SmartPass</h1>
                  <p className="text-sm text-[#616f89] dark:text-gray-400">Admin Panel</p>
                </div>
              </div>

              <nav className="flex flex-col gap-2 pt-4">
                <a href="/dashboard" className="flex items-center gap-3 rounded-lg bg-primary/10 dark:bg-primary/20 px-3 py-2">
                  <span className="material-symbols-outlined fill text-primary">dashboard</span>
                  <p className="text-sm font-medium text-primary">Dashboard</p>
                </a>
                <a href="/employees" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/10">
                  <span className="material-symbols-outlined text-[#111318] dark:text-gray-300">group</span>
                  <p className="text-sm font-medium text-[#111318] dark:text-gray-300">Employees</p>
                </a>
                <a href="/qr-codes" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/10">
                  <span className="material-symbols-outlined text-[#111318] dark:text-gray-300">qr_code_2</span>
                  <p className="text-sm font-medium text-[#111318] dark:text-gray-300">QR CODES</p>
                </a>
                <a href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/10">
                  <span className="material-symbols-outlined text-[#111318] dark:text-gray-300">settings</span>
                  <p className="text-sm font-medium text-[#111318] dark:text-gray-300">Settings</p>
                </a>
              </nav>
            </div>

            <a href="/login" onClick={() => localStorage.removeItem("token")} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/10">
              <span className="material-symbols-outlined text-[#111318] dark:text-gray-300">logout</span>
              <p className="text-sm font-medium text-[#111318] dark:text-gray-300">Logout</p>
            </a>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex flex-1 flex-col">
          {/* HEADER */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark/50 px-8">
            <div className="text-2xl font-bold text-primary">SmartPass Angola</div>
            <div className="flex items-center gap-4">
              <div className="bg-cover bg-center rounded-full size-10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9sz9sFiriGBV-t7cVHX3_l4l6MBchNlRwGxlyxTaL5yxGKOU_nOQZXaXWDqd9o8UNrkO_i-E95vqVVEVPtsZ_YgVchf6J8zvQlf4oGhQqp_ZwwApAU6Vdv-c4hH5OBClybMUMRmw7CuSpx1xCxU0TOP8HY_HBE6gp8DAc-DiNmrcSUGw1GBuVZvYd6wuDoXEEuEOHM0c84iMLy5QQV9yfjjw2FCpGY6exH1-s7xLVDH_X9q7-iUgLulLtrOJyI3omKfDmNklQas9S')" }}></div>
              <div className="text-sm">
                <p className="font-semibold text-gray-800 dark:text-gray-200">Administrator</p>
                <p className="text-gray-500 dark:text-gray-400">admin@smartpass.ao</p>
              </div>
            </div>
          </header>

          {/* CORPO DO DASHBOARD */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">

              {/* TÍTULO + BOTÕES */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold tracking-tight text-[#111318] dark:text-white">Admin Dashboard</p>
                  <p className="text-base text-[#616f89] dark:text-gray-400">Bem-vindo de volta, chefe. Aqui está o que está acontecendo hoje.</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 h-10 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
                    <span className="material-symbols-outlined text-lg">summarize</span>
                    Generate Report
                  </button>
                  <button onClick={goToAddEmployee} className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add New Employee
                  </button>
                </div>
              </div>

              {/* CARDS DE ESTATÍSTICAS */}
              {loading ? (
                <p className="text-center text-gray-500">A carregar dados da nuvem...</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl bg-white dark:bg-background-dark/50 border border-gray-200 dark:border-gray-800 p-6">
                      <p className="text-base font-medium text-[#111318] dark:text-gray-300">Total Employees</p>
                      <p className="text-3xl font-bold text-[#111318] dark:text-white">{stats.totalEmployees}</p>
                      <p className="text-sm font-medium text-green-600">+12% este mês</p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-background-dark/50 border border-gray-200 dark:border-gray-800 p-6">
                      <p className="text-base font-medium text-[#111318] dark:text-gray-300">Active Employees</p>
                      <p className="text-3xl font-bold text-[#111318] dark:text-white">{stats.activeEmployees}</p>
                      <p className="text-sm font-medium text-green-600">+8% este mês</p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-background-dark/50 border border-gray-200 dark:border-gray-800 p-6">
                      <p className="text-base font-medium text-[#111318] dark:text-gray-300">QR Codes Generated</p>
                      <p className="text-3xl font-bold text-[#111318] dark:text-white">{stats.qrGenerated}</p>
                      <p className="text-sm font-medium text-green-600">+25% este mês</p>
                    </div>
                  </div>

                  {/* RECENT ACTIVITY */}
                  <div className="rounded-xl bg-white dark:bg-background-dark/50 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between p-6 pb-0">
                      <h3 className="text-lg font-semibold text-[#111318] dark:text-white">Recent Activity</h3>
                      <a href="/employees" className="text-sm font-medium text-primary hover:underline">View All</a>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Employee</th>
                            <th className="px-6 py-3 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Action</th>
                            <th className="px-6 py-3 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentActivity.map((act, i) => (
                            <tr key={i} className="border-b border-gray-200 dark:border-gray-800">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="size-8 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${act.photo})` }}></div>
                                  <p className="font-medium text-gray-800 dark:text-gray-200">{act.name}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  act.action.includes("QR") ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" :
                                  "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                }`}>
                                  {act.action}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{act.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}