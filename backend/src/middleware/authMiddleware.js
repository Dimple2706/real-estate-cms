
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required"
    });
  }

  try {
    const token = header.slice(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token"
    });
  }
}

module.exports = { requireAuth };
