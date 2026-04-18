const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
    yearLabel: { type: String, required: true }, // "Year 1", "Year 2", "Coursework", "Research Area"
    yearOrder: { type: Number, required: true }, // for sorting
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Subject", SubjectSchema);
