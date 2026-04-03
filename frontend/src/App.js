import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import ProjectTasks from "./pages/ProjectTasks";

function App() {
  return (
    <Router>
      {/* ✅ TOASTER MUST BE OUTSIDE ROUTES */}
      <Toaster position="top-right" />

      {/* ✅ ROUTES ONLY CONTAIN <Route> */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/projects/:projectId" element={<ProjectTasks />} />
      </Routes>
    </Router>
  );
}

export default App;
