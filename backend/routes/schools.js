const express = require("express");
const router = express.Router();
const { protect, requireRole, optionalProtect } = require("../middleware/authMiddleware");
const {
  getSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
  assignDean,
  removeDean,
} = require("../controllers/schoolController");

// All users can read, deans might see their own school first or specifically
router.get("/", optionalProtect, getSchools);
router.get("/:id", optionalProtect, getSchool);

// SuperAdmin only for writes
router.post("/", protect, requireRole("SuperAdmin"), createSchool);
router.put("/:id", protect, requireRole("SuperAdmin"), updateSchool);
router.delete("/:id", protect, requireRole("SuperAdmin"), deleteSchool);
router.put("/:id/dean", protect, requireRole("SuperAdmin"), assignDean);
router.delete("/:id/dean", protect, requireRole("SuperAdmin"), removeDean);

module.exports = router;
