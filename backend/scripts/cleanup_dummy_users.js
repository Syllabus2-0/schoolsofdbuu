const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for cleanup");

    console.log("Searching for dummy users with '@university.edu' domain...");
    
    const result = await User.deleteMany({ email: { $regex: /@university\.edu$/i } });
    
    console.log(`✅ Successfully deleted ${result.deletedCount} dummy users.`);
    
    process.exit(0);
  } catch (err) {
    console.error("Cleanup error:", err);
    process.exit(1);
  }
}

cleanup();
