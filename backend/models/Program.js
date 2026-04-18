const mongoose = require("mongoose");

const IntakeStatSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    count: { type: Number, required: true },
  },
  { _id: false },
);

const ProgramSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: String, enum: ["UG", "PG", "Ph.D"], required: true },
    duration: { type: Number, required: true }, // in months
    startYear: { type: Number, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    intakeStats: [IntakeStatSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Program", ProgramSchema);
