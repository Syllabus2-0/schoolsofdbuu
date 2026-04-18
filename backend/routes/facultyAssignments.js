const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getAssignments,
  createAssignment,
  deleteAssignment,
} = require("../controllers/facultyAssignmentController");

router.get("/", protect, getAssignments);
router.post("/", protect, requireRole("HOD", "Dean", "SuperAdmin"), createAssignment);
router.delete("/:id", protect, requireRole("HOD", "Dean", "SuperAdmin"), deleteAssignment);

module.exports = router;
