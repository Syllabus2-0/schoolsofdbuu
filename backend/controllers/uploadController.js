// POST /api/upload — generic file upload for CO/CLO documents
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const fileData = {
      id: req.file.filename,
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id.toString(),
      uploadedAt: new Date().toISOString(),
    };

    res.status(201).json(fileData);
  } catch (err) {
    console.error("uploadFile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
