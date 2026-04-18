const mongoose = require("mongoose");

const POPSODocumentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["PO", "PSO"], required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    yearOrder: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Ensure one PO and one PSO per department per year
POPSODocumentSchema.index({ type: 1, departmentId: 1, yearOrder: 1 }, { unique: true });

module.exports = mongoose.model("POPSODocument", POPSODocumentSchema);
