const User = require("../models/User");

// GET /api/users?role=&schoolId=&departmentId=
exports.getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.schoolId) filter.schoolId = req.query.schoolId;
    if (req.query.departmentId) filter.departmentId = req.query.departmentId;

    // Scope for Dean: users in their school OR users with no school (for recruitment)
    if (req.user.role === "Dean" && req.user.schoolId) {
      filter.$or = [
        { schoolId: req.user.schoolId },
        { schoolId: { $exists: false } },
        { schoolId: null },
      ];
    }
    // Scope for HOD: users in their department OR any Faculty in their school
    if (req.user.role === "HOD" && req.user.departmentId) {
      filter.$or = [
        { departmentId: req.user.departmentId },
        { role: "Faculty", schoolId: req.user.schoolId },
      ];
    }

    const users = await User.find(filter).select("-password").sort("name");
    res.json(users.map(u => u.toSafeObject()));
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.toSafeObject());
  } catch (err) {
    console.error("getUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/users — SuperAdmin creates user with any role
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, schoolId, departmentId, assignedYears } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({
      name, email, password,
      role: role || "Faculty",
      schoolId: schoolId || null,
      departmentId: departmentId || null,
      assignedYears: Array.isArray(assignedYears) ? assignedYears : [],
    });

    res.status(201).json(user.toSafeObject());
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/:id — SuperAdmin updates user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, role, schoolId, departmentId, assignedYears, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (schoolId !== undefined) user.schoolId = schoolId || null;
    if (departmentId !== undefined) user.departmentId = departmentId || null;
    if (assignedYears !== undefined) user.assignedYears = Array.isArray(assignedYears) ? assignedYears : [];
    if (password) user.password = password; // Will be hashed by pre-save hook

    await user.save();
    res.json(user.toSafeObject());
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/users/:id — SuperAdmin deletes user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
