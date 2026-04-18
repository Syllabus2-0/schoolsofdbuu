const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");

const app = express();

// ────────────────────────────────────────────
// Middleware
// ────────────────────────────────────────────
app.use(express.json());
app.use(cors());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/schools", require("./routes/schools"));
app.use("/api/departments", require("./routes/departments"));
app.use("/api/programs", require("./routes/programs"));
app.use("/api/subjects", require("./routes/subjects"));
app.use("/api/faculty-assignments", require("./routes/facultyAssignments"));
app.use("/api/syllabi", require("./routes/syllabi"));
app.use("/api/users", require("./routes/users"));
app.use("/api/popso", require("./routes/popso"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/dashboard", require("./routes/dashboard"));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Backend is running", timestamp: new Date().toISOString() });
});

// ────────────────────────────────────────────
// Global error handler
// ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (err.name === "MulterError") {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  res.status(500).json({ message: "Internal server error" });
});

// ────────────────────────────────────────────
// Server start
// ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
