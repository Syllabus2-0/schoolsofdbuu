const mongoose = require("mongoose");

const DocumentFileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    filePath: { type: String },
    uploadedBy: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const CoCloSchema = new mongoose.Schema({
  code: String,
  desc: String,
}, { _id: false });

const UnitSchema = new mongoose.Schema({
  title: String,
  desc: String,
}, { _id: false });

const MatrixSchema = new mongoose.Schema({
  co: String,
  po: [String],
  pso: [String],
}, { _id: false });

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true },
);

const statuses = ["Draft", "Pending HOD Review", "Pending Dean Approval", "Published"];

const SyllabusSchema = new mongoose.Schema(
  {
    programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: statuses, default: "Draft" },
    courseDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    clos: [CoCloSchema],
    cos: [CoCloSchema],
    units: [UnitSchema],
    references: [String],
    matrix: [MatrixSchema],
    hodSignature: { type: String, default: null },
    deanSignature: { type: String, default: null },
    comments: [CommentSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Syllabus", SyllabusSchema);
