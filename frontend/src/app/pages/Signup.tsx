import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../data/types";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Faculty");
  
  // Realtime config arrays
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  // Role specific scopes
  const [schoolId, setSchoolId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [assignedYears, setAssignedYears] = useState<number[]>([]);

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setCurrentUser, setToken } = useAuth();

  useEffect(() => {
    const fetchSelectables = async () => {
      try {
        const [resSchools, resDepts] = await Promise.all([
          fetch('/api/schools'),
          fetch('/api/departments')
        ]);
        if (resSchools.ok) setSchools(await resSchools.json());
        if (resDepts.ok) setDepartments(await resDepts.json());
      } catch(err) {
        console.error("Failed to fetch signup configs", err);
      }
    };
    fetchSelectables();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        name, 
        email, 
        password, 
        role,
        ...(role === 'Dean' && { schoolId }),
        ...(role === 'HOD' && { departmentId, assignedYears }) 
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      
      setCurrentUser(data.user);
      if (setToken) setToken(data.token);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Signup error");
    }
  };

  const toggleYear = (year: number) => {
    setAssignedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
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

        {error && <div className="text-red-600 mb-4 bg-red-50 p-3 rounded text-sm border border-red-200">{error}</div>}

        <div className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full px-4 py-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full px-4 py-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />

          <label className="block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-4 py-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="SuperAdmin">Super Administrator</option>
            <option value="Dean">Dean</option>
            <option value="HOD">Head of Department</option>
            <option value="Faculty">Faculty Member</option>
          </select>

          {/* Conditional Dean Scoping */}
          {role === 'Dean' && (
            <div className="pt-2 animate-fade-in">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select School
              </label>
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-blue-50"
              >
                <option value="">-- Choose your School --</option>
                {schools.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional HOD Scoping */}
          {role === 'HOD' && (
            <div className="pt-2 animate-fade-in space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Department
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-blue-50"
                >
                  <option value="">-- Choose your Department --</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assigned Years (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map(year => (
                    <label key={year} className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        checked={assignedYears.includes(year)}
                        onChange={() => toggleYear(year)}
                      />
                      <span>Year {year}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Check the distinct years you govern. Leave all blank to govern across ALL years implicitly.
                </p>
              </div>
            </div>
          )}

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white py-3 rounded font-medium mt-4">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
