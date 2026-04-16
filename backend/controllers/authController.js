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
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password, role });

    const token = signToken(user);
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    res.status(201).json({ user: safeUser, token });
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
    if (!matched)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    res.json({ user: safeUser });
  } catch (err) {
    console.error("GetCurrentUser error", err);
    res.status(500).json({ message: "Server error" });
  }
};
