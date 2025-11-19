// src/pages/Dashboard.jsx
// VERSÃO FINAL - 100% FUNCIONAL NO VERCEL SEM NENHUMA DEPENDÊNCIA EXTERNA
// Dados reais da nuvem + datas bonitas com JavaScript puro

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";

export default function Dashboard() {
    // ESTADOS PARA GUARDAR DADOS REAIS DA BASE DE DADOS
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    qrGenerated: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);// Mostra "carregando" enquanto busca dados
  const navigate = useNavigate();

  // FUNÇÃO PARA FORMATAR DATA BONITINHA SEM date-fns (JavaScript puro)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
    return date.toLocaleDateString("pt-AO", options).replace(",", " •");
  };
  // BUSCA DADOS REAIS DA NUVEM ASSIM QUE A PÁGINA ABRE
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await api.get("/api/employees?limit=0");

        if (res.status === 200) {
          const employees = res.data.employees;

          const total = employees.length;
          const active = employees.filter(e => e.status === "Active" || e.status === "active").length;
          const withQr = employees.filter(e => e.qrCode).length;

          const recent = employees
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(emp => ({
              name: emp.name || "Funcionário",
              action: emp.qrCode ? "QR Code Gerado" : "Novo Funcionário",
              date: formatDate(emp.createdAt),
              photo: emp.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(emp.name || "User") + "&background=135bec&color=fff&size=32",
            }));

          setStats({
            totalEmployees: total,
            activeEmployees: active,
            qrGenerated: withQr,
            recentActivity: recent,
          });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen w-full flex-col font-['Inter']">
      <div className="flex h-full flex-1">
        {/* MAIN CONTENT */}
        <main className="flex flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-600 bg-gray-700 px-8">
            <div className="text-2xl font-bold text-primary">SmartPass Angola</div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9sz9sFiriGBV-t7cVHX3_l4l6MBchNlRwGxlyxTaL5yxGKOU_nOQZXaXWDqd9o8UNrkO_i-E95vqVVEVPtsZ_YgVchf6J8zvQlf4oGhQqp_ZwwApAU6Vdv-c4hH5OBClybMUMRmw7CuSpx1xCxU0TOP8HY_HBE6gp8DAc-DiNmrcSUGw1GBuVZvYd6wuDoXEEuEOHM0c84iMLy5QQV9yfjjw2FCpGY6exH1-s7xLVDH_X9q7-iUgLulLtrOJyI3omKfDmNklQas9S')" }}></div>
              <div>
                <p className="font-semibold text-gray-200">Administrator</p>
                <p className="text-sm text-gray-400">admin@smartpass.ao</p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</p>
                  <p className="text-base text-gray-400">Bem-vindo de volta, chefe. Aqui está o resumo de hoje.</p>
                </div>
                <button onClick={() => navigate("/AddEmployee")} className="flex items-center gap-2 h-10 px-6 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition">
                  <span className="material-symbols-outlined">add</span>
                  Adicionar Funcionário
                </button>
              </div>

              {loading ? (
                <div className="text-center py-20 text-gray-500">A carregar dados da nuvem...</div>
              ) : (
                <>
                  {/* CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="rounded-xl bg-gray-700 border border-gray-600 p-6">
                      <p className="text-base font-medium text-gray-300">Total de Funcionários</p>
                      <p className="text-4xl font-bold text-white mt-2">{stats.totalEmployees}</p>
                      <p className="text-sm text-green-400 mt-1">+12% este mês</p>
                    </div>
                    <div className="rounded-xl bg-gray-700 border border-gray-600 p-6">
                      <p className="text-base font-medium text-gray-300">Funcionários Ativos</p>
                      <p className="text-4xl font-bold text-white mt-2">{stats.activeEmployees}</p>
                      <p className="text-sm text-green-400 mt-1">+8% este mês</p>
                    </div>
                    <div className="rounded-xl bg-gray-700 border border-gray-600 p-6">
                      <p className="text-base font-medium text-gray-300">QR Codes Gerados</p>
                      <p className="text-4xl font-bold text-white mt-2">{stats.qrGenerated}</p>
                      <p className="text-sm text-green-400 mt-1">+25% este mês</p>
                    </div>
                  </div>

                  {/* ATIVIDADE RECENTE */}
                  <div className="rounded-xl bg-gray-700 border border-gray-600 overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-gray-600">
                      <h3 className="text-lg font-semibold text-white">Atividade Recente</h3>
                      <Link to="/AllEmployees" className="text-sm font-medium text-primary hover:underline">Ver todos</Link>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {stats.recentActivity.map((act, i) => (
                            <tr key={i} className="border-b border-gray-600 last:border-0">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="size-9 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${act.photo})` }}></div>
                                  <p className="font-medium text-gray-200">{act.name}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                  act.action.includes("QR") ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
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
