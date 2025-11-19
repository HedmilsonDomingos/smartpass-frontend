// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AllEmployees from "./pages/AllEmployees.jsx";
import AddEmployee from "./pages/AddEmployee.jsx";
import EditEmployee from "./pages/EditEmployee.jsx";
import EmployeeDetails from "./pages/EmployeeDetails.jsx";
import PublicEmployeePage from "./pages/PublicEmployeePage.jsx";
import Users from "./pages/Users.jsx";
import EditUser from "./pages/EditUsers.jsx";
import AdminProfile from "./pages/AdminProfile.jsx";
import AddUser from "./pages/AddUser.jsx";
import Reports from "./pages/Reports.jsx";
import CustomReports from "./pages/CustomReports.jsx";
import Settings from "./pages/Settings.jsx";
import RecentActivityLog from "./pages/RecentActivityLog.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Routes outside the main layout */}
        <Route path="/" element={<AdminLogin />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/p/:slug" element={<PublicEmployeePage />} />

        {/* Routes inside the main layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/AllEmployees" element={<AllEmployees />} />
          <Route path="/AddEmployee" element={<AddEmployee />} />
          <Route path="/EditEmployee/:id" element={<EditEmployee />} />
          <Route path="/employee-details/:id" element={<EmployeeDetails />} />
          <Route path="/users" element={<Users />} />
          <Route path="/EditUser/:id" element={<EditUser />} />
          <Route path="/Profile" element={<AdminProfile />} />
          <Route path="/AddUser" element={<AddUser />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/CustomReports" element={<CustomReports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/activity" element={<RecentActivityLog />} />
        </Route>
      </Routes>
    </Router>
  );
}
