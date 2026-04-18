const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getAssignments,
  createAssignment,
  deleteAssignment,
} = require("../controllers/facultyAssignmentController");

router.get("/", protect, getAssignments);
router.post("/", protect, requireRole("HOD", "SuperAdmin"), createAssignment);
router.delete("/:id", protect, requireRole("HOD", "SuperAdmin"), deleteAssignment);

module.exports = router;
