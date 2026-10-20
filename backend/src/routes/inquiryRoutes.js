
const express = require("express");
const rateLimit = require("express-rate-limit");

const { requireAuth } = require("../middleware/authMiddleware");

const {
  submitInquiry,
  listInquiries,
  updateInquiry,
  deleteInquiry
} = require("../controllers/inquiryController");

const router = express.Router();

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

router.post("/", inquiryLimiter, submitInquiry);
router.get("/", requireAuth, listInquiries);
router.patch("/:id", requireAuth, updateInquiry);
router.delete("/:id", requireAuth, deleteInquiry);

module.exports = router;
