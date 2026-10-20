
const prisma = require("../lib/prisma");
const { z } = require("zod");

// Supported CMS collections
const models = {
  projects: "project",
  sections: "section",
  amenities: "amenity",
  gallery: "gallery",
  floorPlans: "floorPlan",
};

// Input validation
const statusSchema = z.enum(["draft", "published"]);

const optionalText = z.string().trim().nullable().optional();

const optionalUrl = z
  .union([z.string().trim().url(), z.literal(""), z.null()])
  .optional()
  .transform((value) => value === "" ? null : value);

const schemas = {
  projects: z.object({
    name: z.string().trim().min(1),
    slug: z.string().trim().min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    location: optionalText,
    description: optionalText,
    heroImage: optionalUrl,
    status: statusSchema.default("draft"),
    seoTitle: optionalText,
    seoDesc: optionalText,
  }).strict(),

  sections: z.object({
    projectId: z.number().int().positive(),
    title: z.string().trim().min(1),
    content: z.string(),
    type: z.string().trim().min(1),
    imageUrl: optionalUrl,
    status: statusSchema.default("draft"),
    order: z.number().int().default(0),
  }).strict(),

  amenities: z.object({
    projectId: z.number().int().positive(),
    name: z.string().trim().min(1),
    icon: optionalText,
    imageUrl: optionalUrl,
    status: statusSchema.default("draft"),
  }).strict(),

  gallery: z.object({
    projectId: z.number().int().positive(),
    title: optionalText,
    imageUrl: z.string().trim().url(),
    category: optionalText,
    status: statusSchema.default("draft"),
  }).strict(),

  floorPlans: z.object({
    projectId: z.number().int().positive(),
    name: z.string().trim().min(1),
    carpetArea: z.number().nonnegative().nullable().optional(),
    totalArea: z.number().nonnegative().nullable().optional(),
    imageUrl: optionalUrl,
    pdfUrl: optionalUrl,
    status: statusSchema.default("draft"),
  }).strict(),
};

function getModel(type) {
  const modelName = models[type];
  return modelName ? prisma[modelName] : null;
}

function sendError(res, error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.flatten(),
    });
  }

  if (error.code === "P2002") {
    return res.status(409).json({
      error: "A record with this unique value already exists.",
    });
  }

  if (error.code === "P2003") {
    return res.status(400).json({
      error: "The selected related record does not exist.",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      error: "Record not found.",
    });
  }

  console.error("CMS error:", error);

  return res.status(500).json({
    error: "Internal server error.",
  });
}

// Store admin actions for auditing
async function logActivity(req, action, entity, entityId) {
  await prisma.activityLog.create({
    data: {
      adminId: req.admin?.id || null,
      action,
      entity,
      entityId,
    },
  });
}

// Restrict public users to published records
// belonging to published projects.
function publicVisibility(type) {
  if (type === "projects") {
    return { status: "published" };
  }

  return {
    status: "published",
    project: {
      is: {
        status: "published",
      },
    },
  };
}

// GET /api/cms/:type
async function list(req, res) {
  try {
    const { type } = req.params;
    const model = getModel(type);

    if (!model) {
      return res.status(404).json({
        error: "Unknown CMS collection.",
      });
    }

    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const isAdmin = Boolean(req.admin);

    const where = isAdmin
      ? {}
      : publicVisibility(type);

    // Filter child records by project
    if (type !== "projects" && req.query.projectId) {
      const projectId = Number(req.query.projectId);

      if (!Number.isInteger(projectId) || projectId <= 0) {
        return res.status(400).json({
          error: "Invalid projectId.",
        });
      }

      where.projectId = projectId;
    }

    // Admins can filter by draft/published status.
    // Public users can only see published records.
    if (isAdmin && req.query.status) {
      if (!["draft", "published"].includes(req.query.status)) {
        return res.status(400).json({
          error: "Invalid status filter.",
        });
      }

      where.status = req.query.status;
    }

    // Search across suitable text fields
    const search = String(req.query.search || "").trim();

    if (search) {
      const searchFields = {
        projects: ["name", "slug", "location"],
        sections: ["title", "type", "content"],
        amenities: ["name"],
        gallery: ["title", "category"],
        floorPlans: ["name"],
      };

      where.OR = searchFields[type].map((field) => ({
        [field]: {
          contains: search,
          mode: "insensitive",
        },
      }));
    }

    const [items, total] = await Promise.all([
      model.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "desc" },
      }),
      model.count({ where }),
    ]);

    return res.json({
      items,
      total,
      page,
      limit,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// GET /api/cms/:type/:id
async function getOne(req, res) {
  try {
    const { type } = req.params;
    const model = getModel(type);

    if (!model) {
      return res.status(404).json({
        error: "Unknown CMS collection.",
      });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "Invalid record ID.",
      });
    }

    const where = {
      id,
      ...(!req.admin ? publicVisibility(type) : {}),
    };

    const item = await model.findFirst({ where });

    if (!item) {
      return res.status(404).json({
        error: "Record not found.",
      });
    }

    return res.json(item);
  } catch (error) {
    return sendError(res, error);
  }
}

// POST /api/cms/:type
async function create(req, res) {
  try {
    const { type } = req.params;
    const model = getModel(type);

    if (!model) {
      return res.status(404).json({
        error: "Unknown CMS collection.",
      });
    }

    const data = schemas[type].parse(req.body);

    const item = await model.create({ data });

    await logActivity(req, "CREATE", type, item.id);

    return res.status(201).json(item);
  } catch (error) {
    return sendError(res, error);
  }
}

// PATCH /api/cms/:type/:id
async function update(req, res) {
  try {
    const { type } = req.params;
    const model = getModel(type);

    if (!model) {
      return res.status(404).json({
        error: "Unknown CMS collection.",
      });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "Invalid record ID.",
      });
    }

    // Partial schema allows editing individual fields
    const data = schemas[type].partial().parse(req.body);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        error: "No fields supplied for update.",
      });
    }

    const item = await model.update({
      where: { id },
      data,
    });

    await logActivity(req, "UPDATE", type, item.id);

    return res.json(item);
  } catch (error) {
    return sendError(res, error);
  }
}

// DELETE /api/cms/:type/:id
async function remove(req, res) {
  try {
    const { type } = req.params;
    const model = getModel(type);

    if (!model) {
      return res.status(404).json({
        error: "Unknown CMS collection.",
      });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "Invalid record ID.",
      });
    }

    await model.delete({
      where: { id },
    });

    await logActivity(req, "DELETE", type, id);

    return res.json({
      message: "Record deleted successfully.",
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// GET /api/cms/activity-logs
async function activityLogs(req, res) {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return res.json(logs);
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  activityLogs,
};
