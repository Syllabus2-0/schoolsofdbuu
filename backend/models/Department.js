const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    hodId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Department", DepartmentSchema);
