const POPSODocument = require("../models/POPSODocument");
const Department = require("../models/Department");
const { hasAssignedYear, idsEqual } = require("../utils/accessScope");

// GET /api/popso?departmentId=&yearOrder=
exports.getDocuments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.departmentId) filter.departmentId = req.query.departmentId;
    const yOrder = req.query.yearOrder || req.query.year;
    if (yOrder) filter.yearOrder = parseInt(yOrder);

    if (req.user.role === "Dean" && req.user.schoolId) {
      const deptIds = await Department.find({ schoolId: req.user.schoolId }).distinct("_id");
      filter.departmentId = req.query.departmentId ? req.query.departmentId : { $in: deptIds };
      if (req.query.departmentId && !deptIds.some((id) => id.toString() === req.query.departmentId.toString())) {
        return res.status(403).json({ message: "Cannot access documents from another school" });
      }
    }

    if (req.user.role === "HOD" && req.user.departmentId) {
      filter.departmentId = req.user.departmentId;
      if (Array.isArray(req.user.assignedYears) && req.user.assignedYears.length > 0) {
        filter.yearOrder = req.query.yearOrder ? parseInt(req.query.yearOrder) : { $in: req.user.assignedYears };
        if (req.query.yearOrder && !hasAssignedYear(req.user, req.query.yearOrder)) {
          return res.status(403).json({ message: "Cannot access documents outside your assigned years" });
        }
      }
    }

    if (req.user.role === "Faculty" && !filter.departmentId && req.user.departmentId) {
      filter.departmentId = req.user.departmentId;
    }

    let docs = await POPSODocument.find(filter)
      .populate("uploadedBy", "name email")
      .populate("departmentId", "name")
      .sort("-uploadedAt");

    if (docs.length === 0 && filter.yearOrder) {
      const fallbackFilter = { ...filter };
      delete fallbackFilter.yearOrder;
      docs = await POPSODocument.find(fallbackFilter)
        .populate("uploadedBy", "name email")
        .populate("departmentId", "name")
        .sort("-uploadedAt");
    }

    res.json(docs);
  } catch (err) {
    console.error("getPOPSO error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// POST /api/popso/upload — HOD uploads PO or PSO
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { type, yearOrder } = req.body;
    if (!type || !["PO", "PSO"].includes(type)) {
      return res.status(400).json({ message: "type must be PO or PSO" });
    }
    if (!yearOrder) {
      return res.status(400).json({ message: "yearOrder is required" });
    }
    const departmentId = req.user.departmentId;
    if (!departmentId) {
      return res.status(403).json({ message: "HOD not assigned to a department" });
    }
    if (!hasAssignedYear(req.user, yearOrder)) {
      return res.status(403).json({ message: "Cannot upload documents outside your assigned years" });
    }

    // Upsert: replace existing doc of same type+dept+year
    const existing = await POPSODocument.findOneAndDelete({
      type,
      departmentId,
      yearOrder: parseInt(yearOrder),
    });

    const doc = await POPSODocument.create({
      type,
      fileName: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: req.user._id,
      departmentId,
      yearOrder: parseInt(yearOrder),
    });

    const populated = await POPSODocument.findById(doc._id)
      .populate("uploadedBy", "name email");

    res.status(201).json(populated);
  } catch (err) {
    console.error("uploadPOPSO error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/popso/:id — HOD deletes document
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await POPSODocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // Scope check
    if (req.user.role === "HOD" && req.user.departmentId.toString() !== doc.departmentId.toString()) {
      return res.status(403).json({ message: "Cannot delete document from another department" });
    }
    if (req.user.role === "HOD" && !hasAssignedYear(req.user, doc.yearOrder)) {
      return res.status(403).json({ message: "Cannot delete document outside your assigned years" });
    }
    if (req.user.role === "Dean") {
      const dept = await Department.findById(doc.departmentId);
      if (!dept || !idsEqual(req.user.schoolId, dept.schoolId)) {
        return res.status(403).json({ message: "Cannot delete document from another school" });
      }
    }

    await doc.deleteOne();
    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error("deletePOPSO error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
