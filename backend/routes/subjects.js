const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");

router.get("/", protect, getSubjects);
router.get("/:id", protect, getSubject);
router.post("/", protect, requireRole("SuperAdmin", "Dean", "HOD"), createSubject);
router.put("/:id", protect, requireRole("SuperAdmin", "Dean", "HOD"), updateSubject);
router.delete("/:id", protect, requireRole("SuperAdmin", "Dean", "HOD"), deleteSubject);

module.exports = router;
