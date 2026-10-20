
const express = require("express");
const jwt = require("jsonwebtoken");

const cms = require("../controllers/cmsController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";

  if (header.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(
        header.slice(7),
        process.env.JWT_SECRET,
        { algorithms: ["HS256"] }
      );

      const prisma = require("../lib/prisma");
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true }
      });

      if (admin) req.admin = admin;
    } catch {
      // Invalid tokens receive public-only content.
    }
  }

  next();
}

router.get("/activity-logs", requireAuth, cms.activityLogs);

router.get("/:type", optionalAuth, cms.list);
router.get("/:type/:id", optionalAuth, cms.getOne);

router.post("/:type", requireAuth, cms.create);
router.patch("/:type/:id", requireAuth, cms.update);
router.delete("/:type/:id", requireAuth, cms.remove);

module.exports = router;
