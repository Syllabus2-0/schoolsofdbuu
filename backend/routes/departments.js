const express = require("express");
const router = express.Router();
const { protect, requireRole, optionalProtect } = require("../middleware/authMiddleware");
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignHOD,
  removeHOD,
} = require("../controllers/departmentController");

// All users can read, but authenticated users (Dean/HOD) get scoped results
router.get("/", optionalProtect, getDepartments);
router.get("/:id", optionalProtect, getDepartment);

// Dean (own school) or SuperAdmin for writes
router.post("/", protect, requireRole("SuperAdmin", "Dean"), createDepartment);
router.put("/:id", protect, requireRole("SuperAdmin", "Dean"), updateDepartment);
router.delete("/:id", protect, requireRole("SuperAdmin", "Dean"), deleteDepartment);
router.put("/:id/hod", protect, requireRole("SuperAdmin", "Dean"), assignHOD);
router.delete("/:id/hod", protect, requireRole("SuperAdmin", "Dean"), removeHOD);

module.exports = router;
