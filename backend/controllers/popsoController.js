const POPSODocument = require("../models/POPSODocument");

// GET /api/popso?departmentId=&yearOrder=
exports.getDocuments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.departmentId) filter.departmentId = req.query.departmentId;
    if (req.query.yearOrder) filter.yearOrder = parseInt(req.query.yearOrder);

    const docs = await POPSODocument.find(filter)
      .populate("uploadedBy", "name email")
      .populate("departmentId", "name")
      .sort("-uploadedAt");
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

    await doc.deleteOne();
    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error("deletePOPSO error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
