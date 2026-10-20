
const prisma = require("../lib/prisma");
const { z } = require("zod");

const inquirySchema = z.object({
  projectId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(25).optional(),
  message: z.string().trim().min(5).max(5000)
});

async function submitInquiry(req, res) {
  const parsed = inquirySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid inquiry",
      details: parsed.error.flatten()
    });
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: parsed.data.projectId,
        status: "published"
      }
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found"
      });
    }

    const inquiry = await prisma.inquiry.create({
      data: parsed.data
    });

    res.status(201).json({
      message: "Inquiry submitted successfully",
      id: inquiry.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
}

async function listInquiries(req, res) {
  try {
    const where = {};

    if (req.query.status) {
      where.status = String(req.query.status);
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    res.json(inquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
}

async function updateInquiry(req, res) {
  const recordId = Number(req.params.id);

  if (!Number.isInteger(recordId) || recordId <= 0) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const parsed = z.object({
    status: z.enum(["new", "contacted", "closed"])
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const inquiry = await prisma.inquiry.update({
      where: { id: recordId },
      data: parsed.data
    });

    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: "UPDATE",
        entity: "inquiries",
        entityId: recordId
      }
    });

    res.json(inquiry);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    res.status(500).json({ error: "Update failed" });
  }
}

async function deleteInquiry(req, res) {
  const recordId = Number(req.params.id);

  if (!Number.isInteger(recordId) || recordId <= 0) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    await prisma.inquiry.delete({
      where: { id: recordId }
    });

    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: "DELETE",
        entity: "inquiries",
        entityId: recordId
      }
    });

    res.json({ message: "Inquiry deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    res.status(500).json({ error: "Delete failed" });
  }
}

module.exports = {
  submitInquiry,
  listInquiries,
  updateInquiry,
  deleteInquiry
};
