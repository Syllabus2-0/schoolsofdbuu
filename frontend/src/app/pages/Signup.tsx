import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../data/types";

interface School {
  _id: string;
  name: string;
  code: string;
}

interface Department {
  _id: string;
  name: string;
}

type ActiveRole = Exclude<UserRole, "SuperAdmin">;

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<ActiveRole>("Faculty");
  const [schoolId, setSchoolId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setCurrentUser, setToken } = useAuth();

  useEffect(() => {
    const fetchSelectables = async () => {
      try {
        const [resSchools, resDepartments] = await Promise.all([
          fetch("/api/schools"),
          fetch("/api/departments"),
        ]);

        if (resSchools.ok) setSchools(await resSchools.json());
        if (resDepartments.ok) setDepartments(await resDepartments.json());
      } catch (err) {
        console.error("Failed to load signup options", err);
      }
    };

    fetchSelectables();
  }, []);

  useEffect(() => {
    if (role !== "Dean") {
      setSchoolId("");
    }

    if (role !== "HOD") {
      setDepartmentId("");
    }
  }, [role]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        email,
        password,
        role,
        ...(role === "Dean" && { schoolId }),
        ...(role === "HOD" && {
          departmentId,
        }),
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Signup error";
      setError(errorMessage);
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

        {error && (
          <div className="text-red-600 mb-4 bg-red-50 p-3 rounded text-sm border border-red-200">
            {error}
          </div>
        )}
        <div className="text-slate-600 mb-4 bg-blue-50 p-3 rounded text-sm border border-blue-200">
          Demo mode is enabled so you can actively create Registrar, Dean, HOD, and Faculty accounts and test the full flow from scratch.
        </div>

        <div className="space-y-4">
          <input
            title="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <input
            title="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full px-4 py-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <input
            title="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full px-4 py-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>
            <select
              id="role"
              title="Select role"
              value={role}
              onChange={(e) => setRole(e.target.value as ActiveRole)}
              className="w-full px-4 py-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="Registrar">Registrar</option>
              <option value="Faculty">Faculty</option>
              <option value="HOD">HOD</option>
              <option value="Dean">Dean</option>
            </select>
          </div>

          {role === "Dean" && (
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-slate-700 mb-1">
                School
              </label>
              <select
                id="school"
                title="Select school"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="">Choose a school later if needed...</option>
                {schools.map((school) => (
                  <option key={school._id} value={school._id}>
                    {school.name} ({school.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {role === "HOD" && (
            <>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">
                  Department
                </label>
                <select
                  id="department"
                  title="Select department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="">Choose a department later if needed...</option>
                  {departments.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>


            </>
          )}

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white py-3 rounded font-medium mt-4">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
