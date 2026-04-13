const express = require("express");

const app = express();

// middleware
app.use(express.json());

// route
app.get("/", (req, res) => {
    res.send("Backend is running");
});

// server start
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});