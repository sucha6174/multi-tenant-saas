import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/api";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    tenantSubdomain: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", formData);

      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.data.user)
      );

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Workspace (Subdomain)
            </label>
            <input
              type="text"
              name="tenantSubdomain"
              placeholder="e.g. demo"
              className="w-full px-3 py-2 mt-1 border rounded-md"
              value={formData.tenantSubdomain}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 mt-1 border rounded-md"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 mt-1 border rounded-md"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>

        <div className="text-sm text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Link to="/register-tenant" className="text-blue-600 hover:underline">
            Register Organization
          </Link>
        </div>
      </div>
    </div>
  );
}
