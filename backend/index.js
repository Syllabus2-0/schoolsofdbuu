const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const connectDB = require("./config/db");

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/auth", require("./routes/auth"));

// route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// server start
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await connectDB(); // better to await
  console.log(`Server running on port ${PORT}`);
});
