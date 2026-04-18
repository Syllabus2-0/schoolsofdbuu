const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const upload = require("../config/multer");
const {
  getDocuments,
  uploadDocument,
  deleteDocument,
} = require("../controllers/popsoController");

router.get("/", protect, getDocuments);
router.post("/upload", protect, requireRole("HOD"), upload.single("file"), uploadDocument);
router.delete("/:id", protect, requireRole("HOD", "SuperAdmin"), deleteDocument);

module.exports = router;
