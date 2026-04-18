const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
} = require("../controllers/programController");

router.get("/", protect, getPrograms);
router.get("/:id", protect, getProgram);
router.post("/", protect, requireRole("SuperAdmin", "Dean"), createProgram);
router.put("/:id", protect, requireRole("SuperAdmin", "Dean"), updateProgram);
router.delete("/:id", protect, requireRole("SuperAdmin", "Dean"), deleteProgram);

module.exports = router;
