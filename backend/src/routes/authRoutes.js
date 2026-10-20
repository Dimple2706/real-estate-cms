
const express = require("express");
const rateLimit = require("express-rate-limit");

const { login, profile } = require(
  "../controllers/authController"
);

const { requireAuth } = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Try again later."
  }
});

router.post("/login", loginLimiter, login);
router.get("/me", requireAuth, profile);

module.exports = router;
