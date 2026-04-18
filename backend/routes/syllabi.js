const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getSyllabi,
  getSyllabus,
  createSyllabus,
  updateSyllabus,
  submitSyllabus,
  approveSyllabus,
  rejectSyllabus,
  addComment,
} = require("../controllers/syllabusController");

router.get("/", protect, getSyllabi);
router.get("/:id", protect, getSyllabus);
router.post("/", protect, requireRole("Faculty"), createSyllabus);
router.put("/:id", protect, requireRole("Faculty", "SuperAdmin"), updateSyllabus);
router.put("/:id/submit", protect, requireRole("Faculty"), submitSyllabus);
router.put("/:id/approve", protect, requireRole("HOD", "Dean"), approveSyllabus);
router.put("/:id/reject", protect, requireRole("HOD", "Dean"), rejectSyllabus);
router.post("/:id/comments", protect, addComment);

module.exports = router;
