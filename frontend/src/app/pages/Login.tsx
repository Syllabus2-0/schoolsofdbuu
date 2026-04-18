import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setCurrentUser, setToken } = useAuth();



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
      if (setToken) setToken(data.token);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login error";
      setError(errorMessage);
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
          {error && <div className="text-red-600 font-medium text-sm">{error}</div>}
          <input
            title="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <input
            title="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </form>



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
