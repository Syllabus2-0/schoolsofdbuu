const FacultyAssignment = require("../models/FacultyAssignment");
const Subject = require("../models/Subject");
const Department = require("../models/Department");
const User = require("../models/User");
const { hasAssignedYear, idsEqual } = require("../utils/accessScope");

// GET /api/faculty-assignments?departmentId=&facultyId=&subjectId=
exports.getAssignments = async (req, res) => {
  try {
    const filter = {};
    const requestedDepartmentId = req.query.departmentId;
    if (requestedDepartmentId) filter.departmentId = requestedDepartmentId;
    if (req.query.facultyId) filter.facultyId = req.query.facultyId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;

    // Scope for HOD
    if (req.user.role === "HOD" && req.user.departmentId) {
      filter.departmentId = req.user.departmentId;
    }
    if (req.user.role === "Dean" && req.user.schoolId) {
      const deptIds = await Department.find({ schoolId: req.user.schoolId }).distinct("_id");
      if (requestedDepartmentId) {
        if (!deptIds.some((id) => id.toString() === requestedDepartmentId.toString())) {
          return res.json([]);
        }
        filter.departmentId = requestedDepartmentId;
      } else {
        filter.departmentId = { $in: deptIds };
      }
    }
    // Scope for Faculty: only their own
    if (req.user.role === "Faculty") {
      filter.facultyId = req.user._id;
    }

    if (req.user.role === "HOD" && Array.isArray(req.user.assignedYears) && req.user.assignedYears.length > 0) {
      const subjectIds = await Subject.find({
        departmentId: req.user.departmentId,
        yearOrder: { $in: req.user.assignedYears },
      }).distinct("_id");
      filter.subjectId = { $in: subjectIds };
    }

    const assignments = await FacultyAssignment.find(filter)
      .populate("facultyId", "name email")
      .populate({
        path: "subjectId",
        select: "name programId yearLabel yearOrder",
        populate: { path: "programId", select: "name level" }
      })
      .populate("departmentId", "name")
      .populate("schoolId", "name code");
    res.json(assignments);
  } catch (err) {
    console.error("getAssignments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/faculty-assignments — HOD assigns a teacher to a subject
exports.createAssignment = async (req, res) => {
  try {
    const { facultyId, subjectId } = req.body;
    if (!facultyId || !subjectId) {
      return res.status(400).json({ message: "facultyId and subjectId are required" });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    // Scope check: HOD can only assign within their department
    if (req.user.role === "HOD" && req.user.departmentId.toString() !== subject.departmentId.toString()) {
      return res.status(403).json({ message: "Cannot assign teacher in another department" });
    }
    if (req.user.role === "HOD" && !hasAssignedYear(req.user, subject.yearOrder)) {
      return res.status(403).json({ message: "Cannot assign teacher outside your assigned years" });
    }

    const dept = await Department.findById(subject.departmentId);
    if (!dept) return res.status(404).json({ message: "Department not found" });
    if (req.user.role === "Dean" && !idsEqual(req.user.schoolId, dept.schoolId)) {
      return res.status(403).json({ message: "Cannot assign teacher outside your school" });
    }

    const facultyUser = await User.findById(facultyId);
    if (!facultyUser || facultyUser.role !== "Faculty") {
      return res.status(404).json({ message: "Faculty user not found" });
    }
    if (facultyUser.schoolId && !idsEqual(facultyUser.schoolId, dept.schoolId)) {
      return res.status(403).json({ message: "Faculty member belongs to another school" });
    }

    // Remove existing assignment for same subject
    await FacultyAssignment.deleteMany({ subjectId });

    const assignment = await FacultyAssignment.create({
      facultyId,
      subjectId,
      departmentId: subject.departmentId,
      schoolId: dept.schoolId,
    });

    facultyUser.schoolId = dept.schoolId;
    facultyUser.departmentId = subject.departmentId;
    await facultyUser.save();

    const populated = await FacultyAssignment.findById(assignment._id)
      .populate("facultyId", "name email")
      .populate("subjectId", "name programId yearLabel yearOrder");

    res.status(201).json(populated);
  } catch (err) {
    console.error("createAssignment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/faculty-assignments/:id — HOD removes assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await FacultyAssignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    // Scope check
    if (req.user.role === "HOD" && req.user.departmentId.toString() !== assignment.departmentId.toString()) {
      return res.status(403).json({ message: "Cannot remove assignment from another department" });
    }
    if (req.user.role === "Dean" && req.user.schoolId.toString() !== assignment.schoolId.toString()) {
      return res.status(403).json({ message: "Cannot remove assignment from another school" });
    }
    if (req.user.role === "HOD") {
      const subject = await Subject.findById(assignment.subjectId);
      if (subject && !hasAssignedYear(req.user, subject.yearOrder)) {
        return res.status(403).json({ message: "Cannot remove assignment outside your assigned years" });
      }
    }

    await assignment.deleteOne();
    res.json({ message: "Assignment removed" });
  } catch (err) {
    console.error("deleteAssignment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
