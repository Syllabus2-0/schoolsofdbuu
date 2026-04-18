const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const roles = ["SuperAdmin", "Dean", "HOD", "Faculty"];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: roles, default: "Faculty" },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    assignedYears: { type: [Number], default: [] }, // For HOD — which years they manage
  },
  { timestamps: true },
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Return clean user object for API responses
UserSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    schoolId: this.schoolId,
    departmentId: this.departmentId,
    assignedYears: this.assignedYears,
  };
};

module.exports = mongoose.model("User", UserSchema);
