const jwt = require("jsonwebtoken");
const db = require("../db");

// Middleware to protect routes by verifying the JWT
const protect = async (req, res, next) => {
  let token;

  // --- Early exit for missing JWT_SECRET ---
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === "your-super-secret-jwt-key-here"
  ) {
    console.error("FATAL ERROR: JWT_SECRET is not defined or is insecure.");
    return res.status(500).json({
      error: "Server configuration error: JWT secret is missing.",
    });
  }

  // Check for the token in the Authorization header (format: "Bearer <token>")
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Get token from header
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get user from the database using the ID from the token payload
      // We select all fields except the password for security
      const userResult = await db.query(
        "SELECT id, full_name, email, role, is_verified FROM Users WHERE id = $1",
        [decoded.id]
      );

      if (userResult.rows.length === 0) {
        return res
          .status(401)
          .json({ error: "Not authorized, user not found" });
      }

      // 4. Attach the user object to the request for later use
      req.user = userResult.rows[0];

      next(); // Proceed to the next middleware or the route handler
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }
};

// Middleware for optional authentication - attaches user if token exists, but doesn't require it
const optionalAuth = async (req, res, next) => {
  let token;

  // Check for the token in the Authorization header (format: "Bearer <token>")
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Get token from header
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token using the secret key
      if (process.env.JWT_SECRET && process.env.JWT_SECRET !== "your-super-secret-jwt-key-here") {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Get user from the database using the ID from the token payload
        const userResult = await db.query(
          "SELECT id, full_name, email, role, is_verified FROM Users WHERE id = $1",
          [decoded.id]
        );

        if (userResult.rows.length > 0) {
          // Attach the user object to the request if found
          req.user = userResult.rows[0];
        }
      }
    } catch (error) {
      // Token verification failed, but we don't block the request
      console.debug("Optional auth - token verification failed:", error.message);
    }
  }

  // Always proceed to next middleware/handler, regardless of auth status
  next();
};

// Middleware to check if the user has an admin role
const isAdmin = (req, res, next) => {
  // This middleware should always run AFTER the 'protect' middleware.
  // 'protect' is responsible for attaching the user object to the request.
  if (req.user && (req.user.role === "administrator" || req.user.role === "admin")) {
    next(); // User is an admin, proceed to the route handler
  } else {
    // If the user is not an admin, send a 403 Forbidden error
    res.status(403).json({ error: "Not authorized as an admin" });
  }
};

module.exports = { protect, optionalAuth, isAdmin };
