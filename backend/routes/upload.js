const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../config/multer");
const { uploadFile } = require("../controllers/uploadController");

router.post("/", protect, upload.single("file"), uploadFile);

module.exports = router;
