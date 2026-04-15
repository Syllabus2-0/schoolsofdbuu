const mongoose = require("mongoose");

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.warn("MONGO_URI not found. Starting with memory fallback.");
        return false;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error("DB Connection Error:", error.message);
        console.warn("Continuing with memory fallback mode.");
        return false;
    }
};

module.exports = connectDB;
