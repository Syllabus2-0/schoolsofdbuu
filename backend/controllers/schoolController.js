const School = require("../models/School");
const Department = require("../models/Department");
const User = require("../models/User");

// GET /api/schools — list schools (scoped by role)
exports.getSchools = async (req, res) => {
  try {
    const filter = {};

    // Scope for Dean: only their school
    if (req.user && req.user.role === "Dean" && req.user.schoolId) {
      filter._id = req.user.schoolId;
    }

    const schools = await School.find(filter).populate("deanId", "name email").sort("code");
    res.json(schools);
  } catch (err) {
    console.error("getSchools error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/schools/:id — single school
exports.getSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id).populate("deanId", "name email");
    if (!school) return res.status(404).json({ message: "School not found" });
    res.json(school);
  } catch (err) {
    console.error("getSchool error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/schools — create school (SuperAdmin only)
exports.createSchool = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ message: "Name and code are required" });

    const existing = await School.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(409).json({ message: "School code already exists" });

    const school = await School.create({ name, code: code.toUpperCase() });
    res.status(201).json(school);
  } catch (err) {
    console.error("createSchool error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/schools/:id — update school (SuperAdmin only)
exports.updateSchool = async (req, res) => {
  try {
    const { name, code } = req.body;
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: "School not found" });

    if (name) school.name = name;
    if (code) school.code = code.toUpperCase();
    await school.save();
    res.json(school);
  } catch (err) {
    console.error("updateSchool error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/schools/:id — delete school (SuperAdmin only)
exports.deleteSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: "School not found" });

    // Check for departments under this school
    const deptCount = await Department.countDocuments({ schoolId: school._id });
    if (deptCount > 0) {
      return res.status(400).json({ message: "Cannot delete school with existing departments. Remove departments first." });
    }

    await school.deleteOne();
    res.json({ message: "School deleted" });
  } catch (err) {
    console.error("deleteSchool error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/schools/:id/dean — assign dean (SuperAdmin only)
exports.assignDean = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: "School not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove previous dean's assignment if exists
    if (school.deanId) {
      await User.findByIdAndUpdate(school.deanId, { schoolId: null });
    }

    // Assign new dean
    school.deanId = user._id;
    await school.save();

    user.role = "Dean";
    user.schoolId = school._id;
    user.departmentId = null;
    user.assignedYears = [];
    await user.save();

    res.json({ message: "Dean assigned", school });
  } catch (err) {
    console.error("assignDean error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/schools/:id/dean — remove dean (SuperAdmin only)
exports.removeDean = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: "School not found" });

    if (school.deanId) {
      await User.findByIdAndUpdate(school.deanId, { schoolId: null });
      school.deanId = null;
      await school.save();
    }

    res.json({ message: "Dean removed", school });
  } catch (err) {
    console.error("removeDean error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
