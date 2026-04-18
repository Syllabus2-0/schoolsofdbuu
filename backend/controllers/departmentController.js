const Department = require("../models/Department");
const User = require("../models/User");
const Program = require("../models/Program");
const { canAccessDepartment } = require("../utils/accessScope");

// GET /api/departments?schoolId=
exports.getDepartments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.schoolId) filter.schoolId = req.query.schoolId;

    // Scope for Dean: only their school
    if (req.user && req.user.role === "Dean" && req.user.schoolId) {
      filter.schoolId = req.user.schoolId;
    }
    // Scope for HOD: only their department
    if (req.user && req.user.role === "HOD" && req.user.departmentId) {
      filter._id = req.user.departmentId;
    }
    // Scope for Faculty: departments they are assigned to via subjects (optional enrichment)
    // For now, faculty can see all departments in their school if they have one
    if (req.user && req.user.role === "Faculty" && req.user.schoolId) {
      filter.schoolId = req.user.schoolId;
    }

    const departments = await Department.find(filter)
      .populate("schoolId", "name code")
      .populate("hodId", "name email assignedYears")
      .sort("name");
    res.json(departments);
  } catch (err) {
    console.error("getDepartments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/departments/:id
exports.getDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id)
      .populate("schoolId", "name code")
      .populate("hodId", "name email assignedYears");
    if (!dept) return res.status(404).json({ message: "Department not found" });
    if (req.user && !canAccessDepartment(req.user, dept)) {
      return res.status(403).json({ message: "Cannot access another department" });
    }
    res.json(dept);
  } catch (err) {
    console.error("getDepartment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/departments — Dean (own school) or SuperAdmin
exports.createDepartment = async (req, res) => {
  try {
    const { name, schoolId } = req.body;
    if (!name || !schoolId) return res.status(400).json({ message: "Name and schoolId are required" });

    // Scope check: Dean can only create in their own school
    if (req.user.role === "Dean" && req.user.schoolId.toString() !== schoolId) {
      return res.status(403).json({ message: "Cannot create department in another school" });
    }

    const dept = await Department.create({ name, schoolId });
    res.status(201).json(dept);
  } catch (err) {
    console.error("createDepartment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/departments/:id
exports.updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    // Scope check
    if (req.user.role === "Dean" && req.user.schoolId.toString() !== dept.schoolId.toString()) {
      return res.status(403).json({ message: "Cannot update department in another school" });
    }

    if (req.body.name) dept.name = req.body.name;
    await dept.save();
    res.json(dept);
  } catch (err) {
    console.error("updateDepartment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/departments/:id
exports.deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    if (req.user.role === "Dean" && req.user.schoolId.toString() !== dept.schoolId.toString()) {
      return res.status(403).json({ message: "Cannot delete department in another school" });
    }

    // Check for programs under this department
    const progCount = await Program.countDocuments({ departmentId: dept._id });
    if (progCount > 0) {
      return res.status(400).json({ message: "Cannot delete department with existing programs" });
    }

    await dept.deleteOne();
    res.json({ message: "Department deleted" });
  } catch (err) {
    console.error("deleteDepartment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/departments/:id/hod — assign HOD
exports.assignHOD = async (req, res) => {
  try {
    const { userId, assignedYears } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    if (req.user.role === "Dean" && req.user.schoolId.toString() !== dept.schoolId.toString()) {
      return res.status(403).json({ message: "Cannot assign HOD in another school" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove previous HOD assignment
    if (dept.hodId) {
      await User.findByIdAndUpdate(dept.hodId, {
        departmentId: null,
        assignedYears: [],
      });
    }

    dept.hodId = user._id;
    await dept.save();

    user.role = "HOD";
    user.schoolId = dept.schoolId;
    user.departmentId = dept._id;
    user.assignedYears = Array.isArray(assignedYears) ? assignedYears : [];
    user.requestedRole = "HOD";
    user.requestedSchoolId = dept.schoolId;
    user.requestedDepartmentId = dept._id;
    user.requestedAssignedYears = Array.isArray(assignedYears) ? assignedYears : [];
    await user.save();

    res.json({ message: "HOD assigned", department: dept });
  } catch (err) {
    console.error("assignHOD error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/departments/:id/hod — remove HOD
exports.removeHOD = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    if (req.user.role === "Dean" && req.user.schoolId.toString() !== dept.schoolId.toString()) {
      return res.status(403).json({ message: "Cannot remove HOD from another school" });
    }

    if (dept.hodId) {
      await User.findByIdAndUpdate(dept.hodId, {
        departmentId: null,
        assignedYears: [],
      });
      dept.hodId = null;
      await dept.save();
    }

    res.json({ message: "HOD removed", department: dept });
  } catch (err) {
    console.error("removeHOD error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
