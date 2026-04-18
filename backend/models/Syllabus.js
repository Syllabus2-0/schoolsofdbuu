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

const CourseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    type: { type: String, enum: ["Core", "Elective", "Lab"], default: "Core" },
    description: { type: String, default: "" },
    coDocument: DocumentFileSchema,
    cloDocument: DocumentFileSchema,
  },
  { _id: true },
);

const SemesterSchema = new mongoose.Schema(
  {
    semesterNumber: { type: Number, required: true },
    courses: [CourseSchema],
  },
  { _id: false },
);

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
    semesters: [SemesterSchema],
    hodSignature: { type: String, default: null },
    deanSignature: { type: String, default: null },
    comments: [CommentSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Syllabus", SyllabusSchema);
