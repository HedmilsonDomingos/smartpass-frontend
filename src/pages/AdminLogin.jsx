// src/pages/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple demo login – replace with real API later
    if (username === "admin" && password === "admin") {
      localStorage.setItem("token", "demo-token");
      navigate("/dashboard");
    } else {
      alert("Wrong credentials – try admin / admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Log In</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="text-sm font-medium">Username</span>
            <input
              type="text"
              className="mt-1 block w-full h-12 rounded-lg border border-gray-300 bg-white px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              className="mt-1 block w-full h-12 rounded-lg border border-gray-300 bg-white px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="w-full h-12 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}