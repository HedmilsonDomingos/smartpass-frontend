// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AllEmployees from "./pages/AllEmployees.jsx";
import AddEmployee from "./pages/AddEmployee.jsx";
import EditEmployee from "./pages/EditEmployee.jsx";
import EmployeeDetails from "./pages/EmployeeDetails.jsx";
import PublicEmployeePage from "./pages/PublicEmployeePage.jsx";
import Users from "./pages/Users.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Default route – show login */}
        <Route path="/" element={<AdminLogin />} />
        <Route path="/login" element={<AdminLogin />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<AllEmployees />} />
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/edit-employee/:id" element={<EditEmployee />} />
        <Route path="/employee-details/:id" element={<EmployeeDetails />} />
        <Route path="/public-employee/:id" element={<PublicEmployeePage />} />
        <Route path="/users" element={<Users />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}