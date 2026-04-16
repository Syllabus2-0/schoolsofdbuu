import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../data/universityData";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Faculty");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      setCurrentUser(data.user);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Signup error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSignup}
        className="bg-white rounded-lg shadow-sm border border-slate-200 w-full max-w-md p-8"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Create an account</h1>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-3 border rounded"
          />
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

          <label className="block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-4 py-3 border rounded"
          >
            <option value="SuperAdmin">Super Administrator</option>
            <option value="Dean">Dean</option>
            <option value="HOD">Head of Department</option>
            <option value="Faculty">Faculty Member</option>
          </select>

          <button className="w-full bg-indigo-600 text-white py-3 rounded">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
