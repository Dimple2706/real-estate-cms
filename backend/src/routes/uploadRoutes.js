
const express = require("express");
const multer = require("multer");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Unsupported file type"));
    }
    callback(null, true);
  },
});

function validateFile(file) {
  const b = file.buffer;
  const mime = file.mimetype;

  if (mime === "image/jpeg") {
    return b.length >= 3 &&
      b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  }

  if (mime === "image/png") {
    return b.length >= 8 &&
      b.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      );
  }

  if (mime === "image/webp") {
    return b.length >= 12 &&
      b.toString("ascii", 0, 4) === "RIFF" &&
      b.toString("ascii", 8, 12) === "WEBP";
  }

  if (mime === "application/pdf") {
    return b.length >= 5 &&
      b.toString("ascii", 0, 5) === "%PDF-";
  }

  return false;
}

// Admin-only upload
router.post("/", requireAuth, (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file || !validateFile(req.file)) {
      return res.status(400).json({
        error: "Please select a valid JPG, PNG, WebP, or PDF file.",
      });
    }

    try {
      const record = await prisma.uploadedFile.create({
        data: {
          filename: req.file.originalname,
          mimeType: req.file.mimetype,
          data: req.file.buffer,
        },
      });

      const baseUrl = `${req.protocol}://${req.get("host")}`;

      return res.status(201).json({
        id: record.id,
        url: `${baseUrl}/api/uploads/${record.id}`,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      return res.status(500).json({
        error: "Could not save file.",
      });
    }
  });
});

// Public file access for published website content
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid file ID." });
  }

  try {
    const file = await prisma.uploadedFile.findUnique({
      where: { id },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    });

    return res.send(Buffer.from(file.data));
  } catch (error) {
    console.error("File retrieval failed:", error);
    return res.status(500).json({ error: "Could not load file." });
  }
});

module.exports = router;
