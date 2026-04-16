import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../data/universityData";
import { users } from "../data/universityData";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("Faculty");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const handleDemoLogin = () => {
    const user = users.find((u) => u.role === selectedRole);
    if (user) {
      setCurrentUser(user);
      navigate("/");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setCurrentUser(data.user);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            University CMS
          </h1>
          <p className="text-slate-600">
            Academic Curriculum Management System
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="text-red-600">{error}</div>}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 border rounded"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full px-4 py-3 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="my-6 border-t pt-6">
          <div className="mb-4 text-sm text-slate-600">
            Or try demo mode by selecting a role
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Your Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900"
            >
              <option value="SuperAdmin">Super Administrator</option>
              <option value="Dean">Dean</option>
              <option value="HOD">Head of Department</option>
              <option value="Faculty">Faculty Member</option>
            </select>
          </div>

          <button
            onClick={handleDemoLogin}
            className="mt-4 w-full bg-slate-200 text-slate-900 py-3 rounded-lg"
          >
            Demo Sign In
          </button>
        </div>

        <div className="text-center text-sm text-slate-500 mt-4">
          <p>
            Need an account?{" "}
            <Link to="/signup" className="text-indigo-600">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
