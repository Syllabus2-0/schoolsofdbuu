const Department = require("../models/Department");
const { isTopLevelAdmin } = require("../utils/accessScope");

/**
 * Middleware: ensures Dean can only access resources within their own school.
 * Expects req.user to be populated by protect middleware.
 */
const requireSchoolScope = async (req, res, next) => {
  try {
    if (isTopLevelAdmin(req.user)) return next();

    if (req.user.role === "Dean") {
      if (!req.user.schoolId) {
        return res.status(403).json({ message: "Dean not assigned to any school" });
      }
      // Attach for downstream use
      req.scopedSchoolId = req.user.schoolId.toString();
      return next();
    }

    return res.status(403).json({ message: "Forbidden: insufficient role for this resource" });
  } catch (err) {
    console.error("requireSchoolScope error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Middleware: ensures HOD can only access resources within their own department.
 * Also resolves the department's schoolId for cross-checks.
 */
const requireDeptScope = async (req, res, next) => {
  try {
    if (isTopLevelAdmin(req.user)) return next();
    if (req.user.role === "Dean") {
      if (!req.user.schoolId) {
        return res.status(403).json({ message: "Dean not assigned to any school" });
      }
      req.scopedSchoolId = req.user.schoolId.toString();
      return next();
    }

    if (req.user.role === "HOD") {
      if (!req.user.departmentId) {
        return res.status(403).json({ message: "HOD not assigned to any department" });
      }
      const dept = await Department.findById(req.user.departmentId);
      if (!dept) {
        return res.status(403).json({ message: "Department not found" });
      }
      req.scopedDeptId = req.user.departmentId.toString();
      req.scopedSchoolId = dept.schoolId.toString();
      req.scopedYears = req.user.assignedYears;
      return next();
    }

    return res.status(403).json({ message: "Forbidden: insufficient role for this resource" });
  } catch (err) {
    console.error("requireDeptScope error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { requireSchoolScope, requireDeptScope };
