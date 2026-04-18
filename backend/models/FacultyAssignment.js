const mongoose = require("mongoose");

const FacultyAssignmentSchema = new mongoose.Schema(
  {
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true, unique: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FacultyAssignment", FacultyAssignmentSchema);
