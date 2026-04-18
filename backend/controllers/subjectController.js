const Subject = require("../models/Subject");
const Department = require("../models/Department");
const Program = require("../models/Program");
const { canAccessSubject, hasAssignedYear } = require("../utils/accessScope");

// GET /api/subjects?programId=&departmentId=
exports.getSubjects = async (req, res) => {
  try {
    const filter = {};
    const requestedProgramId = req.query.programId;
    const requestedDepartmentId = req.query.departmentId;
    if (requestedProgramId) filter.programId = requestedProgramId;
    if (requestedDepartmentId) filter.departmentId = requestedDepartmentId;

    // Scope for Dean: only their school
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
    // Scope for HOD: only their department
    if (req.user.role === "HOD" && req.user.departmentId) {
      filter.departmentId = req.user.departmentId;
      if (Array.isArray(req.user.assignedYears) && req.user.assignedYears.length > 0) {
        filter.yearOrder = { $in: req.user.assignedYears };
      }
    }
    // Scope for Faculty: only their department
    if (req.user.role === "Faculty" && req.user.departmentId) {
      filter.departmentId = req.user.departmentId;
    }

    const subjects = await Subject.find(filter)
      .populate("programId", "name level duration")
      .populate("departmentId", "name schoolId")
      .sort({ programId: 1, yearOrder: 1, name: 1 });
    res.json(subjects);
  } catch (err) {
    console.error("getSubjects error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/subjects/:id
exports.getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate("programId", "name level")
      .populate("departmentId", "name schoolId");
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    const dept = await Department.findById(subject.departmentId?._id || subject.departmentId);
    if (!canAccessSubject(req.user, subject, dept)) {
      return res.status(403).json({ message: "Cannot access another subject" });
    }
    res.json(subject);
  } catch (err) {
    console.error("getSubject error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/subjects
exports.createSubject = async (req, res) => {
  try {
    const { name, programId, yearLabel, yearOrder, departmentId } = req.body;
    if (!name || !programId || !yearLabel || yearOrder == null || !departmentId) {
      return res.status(400).json({ message: "name, programId, yearLabel, yearOrder, departmentId are required" });
    }

    // Scope check for HOD
    if (req.user.role === "HOD" && req.user.departmentId.toString() !== departmentId) {
      return res.status(403).json({ message: "Cannot create subject in another department" });
    }
    if (req.user.role === "HOD" && !hasAssignedYear(req.user, yearOrder)) {
      return res.status(403).json({ message: "Cannot create subject outside your assigned years" });
    }
    // Scope check for Dean
    if (req.user.role === "Dean") {
      const dept = await Department.findById(departmentId);
      if (!dept || dept.schoolId.toString() !== req.user.schoolId.toString()) {
        return res.status(403).json({ message: "Cannot create subject in another school" });
      }
    }

    const subject = await Subject.create({ name, programId, yearLabel, yearOrder, departmentId });
    res.status(201).json(subject);
  } catch (err) {
    console.error("createSubject error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/subjects/:id
exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    // Scope check
    if (req.user.role === "HOD" && req.user.departmentId.toString() !== subject.departmentId.toString()) {
      return res.status(403).json({ message: "Cannot update subject in another department" });
    }

    const { name, yearLabel, yearOrder } = req.body;
    if (req.user.role === "HOD") {
      const nextYearOrder = yearOrder != null ? yearOrder : subject.yearOrder;
      if (!hasAssignedYear(req.user, subject.yearOrder) || !hasAssignedYear(req.user, nextYearOrder)) {
        return res.status(403).json({ message: "Cannot update subject outside your assigned years" });
      }
    }
    if (name) subject.name = name;
    if (yearLabel) subject.yearLabel = yearLabel;
    if (yearOrder != null) subject.yearOrder = yearOrder;
    await subject.save();
    res.json(subject);
  } catch (err) {
    console.error("updateSubject error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/subjects/:id
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    if (req.user.role === "HOD" && req.user.departmentId.toString() !== subject.departmentId.toString()) {
      return res.status(403).json({ message: "Cannot delete subject in another department" });
    }
    if (req.user.role === "HOD" && !hasAssignedYear(req.user, subject.yearOrder)) {
      return res.status(403).json({ message: "Cannot delete subject outside your assigned years" });
    }

    await subject.deleteOne();
    res.json({ message: "Subject deleted" });
  } catch (err) {
    console.error("deleteSubject error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
