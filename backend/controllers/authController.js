const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Department = require("../models/Department");

const signToken = (user) => {
  const payload = { id: user._id, role: user.role, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "7d",
  });
};

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "Faculty",
      schoolId,
      departmentId,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (!["Registrar", "Dean", "HOD", "Faculty"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    let finalSchoolId = schoolId || null;
    let finalDepartmentId = departmentId || null;
    let finalAssignedYears = [];

    if (finalDepartmentId && !finalSchoolId) {
      const department = await Department.findById(finalDepartmentId);
      if (!department) {
        return res.status(404).json({ message: "Selected department not found" });
      }
      finalSchoolId = department.schoolId;
    }

    if (role === "Registrar") {
      finalSchoolId = null;
      finalDepartmentId = null;
      finalAssignedYears = [];
    }

    if (role === "Dean") {
      finalDepartmentId = null;
      finalAssignedYears = [];
    }

    if (role === "Faculty") {
      finalAssignedYears = [];
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      schoolId: finalSchoolId,
      departmentId: finalDepartmentId,
      assignedYears: finalAssignedYears,
      requestedRole: role,
      requestedSchoolId: finalSchoolId,
      requestedDepartmentId: finalDepartmentId,
      requestedAssignedYears: finalAssignedYears,
    });

    const token = signToken(user);
    res.status(201).json({ user: user.toSafeObject(), token });
  } catch (err) {
    console.error("Signup error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const matched = await user.comparePassword(password);
    if (!matched) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({ user: user.toSafeObject(), token });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    console.error("GetCurrentUser error", err);
    res.status(500).json({ message: "Server error" });
  }
};
