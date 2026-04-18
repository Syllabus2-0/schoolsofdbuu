const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect — verifies JWT and attaches full user document to req.user
 */
const protect = async (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

/**
 * requireRole — checks user has one of the specified roles
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  next();
};

/**
 * optionalProtect — populates req.user if token exists, but doesn't block if not
 */
const optionalProtect = async (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return next();
  }

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
    next();
  } catch (error) {
    // If token is invalid, we just don't populate req.user
    next();
  }
};

module.exports = { protect, requireRole, optionalProtect };
