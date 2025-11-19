// src/pages/AdminLogin.jsx
// VERSÃO FINAL COM DESIGN PREMIUM + AUTENTICAÇÃO REAL NA NUVEM (Render.com + MongoDB Atlas)
// Feito com orgulho em Luanda, Angola - 11 Novembro 2025

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  // Estados para controlar os campos do formulário
  const [email, setEmail] = useState("");     // Guarda o email digitado
  const [password, setPassword] = useState("");     // Guarda a senha digitada
  const [loading, setLoading] = useState(false);    // Mostra "carregando" no botão
  const [showPassword, setShowPassword] = useState(false); // Alterna visibilidade da senha

  const navigate = useNavigate(); // Permite redirecionar após login com sucesso

  // Função principal: executada quando clica em "Log In"
  const handleSubmit = async (e) => {
    e.preventDefault();           // Impede o recarregamento da página
    setLoading(true);             // Ativa o estado de carregamento

    try {
      // ENVIA OS DADOS PARA O BACKEND LOCAL
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Estamos enviando JSON
        },
        body: JSON.stringify({ email, password }), // Converte os dados para JSON
      });

      const data = await response.json(); // Recebe a resposta do servidor

      if (response.ok) {
        // SUCESSO: login correto
        // Store token under 'authToken' to match other pages' expectations
        localStorage.setItem("authToken", data.token);
        alert("Bem-vindo ao SmartPass Angola! Acesso autorizado.");
        navigate("/dashboard"); // Redireciona para o painel admin
      } else {
        // ERRO: usuário ou senha errados
        alert(data.message || "Usuário ou senha incorretos.");
      }
    } catch (error) {
      // Problema de rede ou servidor offline
      alert("Sem conexão com a internet ou servidor temporariamente indisponível.");
      console.error("Erro no login:", error);
    } finally {
      setLoading(false); // Sempre remove o "carregando" no final
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-['Inter']">
      {/* Container principal com layout em grid (esquerda branding, direita login) */}
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">

              {/* PAINEL ESQUERDO - BRANDING (só aparece bem no desktop) */}
              <div className="flex flex-col justify-center items-center p-8 lg:p-12 bg-white dark:bg-slate-900 order-last lg:order-first">
                <div className="w-full max-w-md text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-primary text-4xl">qr_code_2</span>
                    <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">SmartPass</h1>
                  </div>
                  <h2 className="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-tight">
                    Welcome to SmartPass
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-normal leading-normal">
                    Securely Managing Employee Access.
                  </p>
                  <div 
                    className="mt-8 w-full bg-center bg-no-repeat aspect-square bg-contain rounded-lg"
                    style={{
                      backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDh_Ufb869JAwtvtR7FmHFHJAGmBPsGumpYaOwBR3O2KHMiTCNy4ufYx0MiSn_8waaR3jUXHZ1R3ythYF-JRoWHduQHy6NsgKUAV0Na6dVmVeYpmbxvIPZFPMApNAMuAS17iFbshfzri85H5vaNfLZSf7YXSlL3SGXLDNZ6DM0j9iTINJ9jo3VrwwpuRzMY03QJg9_v-OKRxUh9RYGKgdaRNAkgrMrBEw693tzL1DJAs30V0InodvGFGInxmwjqzzIOnsEWB4yfhq42')"
                    }}
                  ></div>
                </div>
              </div>

              {/* PAINEL DIREITO - FORMULÁRIO DE LOGIN */}
              <div className="flex flex-col justify-center items-center p-8 lg:p-12 bg-background-light dark:bg-background-dark">
                <div className="w-full max-w-md space-y-8">

                  <div>
                    <h1 className="text-text-light dark:text-text-dark tracking-tight text-3xl font-bold leading-tight text-left">
                      Login do Administrador
                    </h1>
                  </div>

                  {/* Formulário */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Campo Email */}
                    <label className="flex flex-col w-full">
                      <p className="text-text-light dark:text-text-dark text-sm font-medium leading-normal pb-2">
                        Email
                      </p>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </label>

                    {/* Campo Senha com botão de mostrar/esconder */}
                    <label className="flex flex-col w-full">
                      <p className="text-text-light dark:text-text-dark text-sm font-medium leading-normal pb-2">
                        Senha
                      </p>
                      <div className="flex w-full flex-1 items-stretch rounded-lg">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 pr-2 border-r-0 text-base font-normal leading-normal"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-500 dark:text-gray-400 flex border border-gray-300 dark:border-gray-600 bg-white items-center justify-center px-4 rounded-r-lg border-l-0 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                        >
                          <span className="material-symbols-outlined">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </label>

                    {/* Esqueci a senha — corrigido para passar no build do Vercel */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => alert("Funcionalidade em desenvolvimento\nContacta o administrador:\n+244 923 456 789")}
                        className="text-sm font-medium text-primary hover:underline focus:outline-none transition"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* Botão de Login */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <span className="truncate">
                        {loading ? "A autenticar..." : "Log In"}
                      </span>
                    </button>

                    {/* Rodapé */}
                    <div className="pt-12 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        © 2025 SmartPass Angola. Feito com orgulho em Luanda. Hem Quick Tech Solution, Lda.
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
