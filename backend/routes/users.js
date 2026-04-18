const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// SuperAdmin gets full CRUD; Dean/HOD get scoped reads inside controller
router.get("/", protect, requireRole("SuperAdmin", "Dean", "HOD"), getUsers);
router.get("/:id", protect, getUser);
router.post("/", protect, requireRole("SuperAdmin"), createUser);
router.put("/:id", protect, requireRole("SuperAdmin"), updateUser);
router.delete("/:id", protect, requireRole("SuperAdmin"), deleteUser);

module.exports = router;
