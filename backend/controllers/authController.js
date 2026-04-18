const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) => {
  const payload = { id: user._id, role: user.role, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "7d",
  });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, schoolId, departmentId, assignedYears } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    // Allow any role to be assigned based on user choice during testing
    const safeRole = role || "Faculty";

    let finalSchoolId = schoolId || null;

    // If departmentId is provided but schoolId is not, derive schoolId from department
    if (departmentId && !finalSchoolId) {
      const Department = require("../models/Department");
      const dept = await Department.findById(departmentId);
      if (dept) {
        finalSchoolId = dept.schoolId;
      }
    }

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: safeRole,
      schoolId: finalSchoolId,
      departmentId: departmentId || null,
      assignedYears: assignedYears || []
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
    // req.user is already populated by protect middleware
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    console.error("GetCurrentUser error", err);
    res.status(500).json({ message: "Server error" });
  }
};
