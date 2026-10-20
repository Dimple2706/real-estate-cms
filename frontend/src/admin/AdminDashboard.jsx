
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Building2, Mail, Layers, Image, Plus,
  Pencil, Trash2, Save, X, RefreshCw
} from "lucide-react";
import api from "../services/api";

const configs = {
  projects: {
    title: "Projects",
    fields: [
      "name", "slug", "location", "description",
      "heroImage", "seoTitle", "seoDesc", "status"
    ]
  },
  sections: {
    title: "Website Sections",
    fields: [
      "projectId", "title", "type", "content",
      "imageUrl", "order", "status"
    ]
  },
  amenities: {
    title: "Amenities",
    fields: ["projectId", "name", "icon", "imageUrl", "status"]
  },
  gallery: {
    title: "Gallery",
    fields: ["projectId", "title", "imageUrl", "category", "status"]
  },
  floorPlans: {
    title: "Floor Plans",
    fields: [
      "projectId", "name", "carpetArea",
      "totalArea", "imageUrl", "pdfUrl", "status"
    ]
  }
};

const labels = {
  projectId: "Project",
  heroImage: "Hero Image URL",
  imageUrl: "Image URL",
  pdfUrl: "PDF URL",
  seoTitle: "SEO Title",
  seoDesc: "SEO Description",
  carpetArea: "Carpet Area (sq. ft.)",
  totalArea: "Total Area (sq. ft.)"
};

const numericFields = [
  "projectId", "order", "carpetArea", "totalArea"
];

const fileFields = ["heroImage", "imageUrl", "pdfUrl"];

function authHeaders() {
  return {
    Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`
  };
}

function errorMessage(error) {
  return error.response?.data?.error || error.message;
}

// -------------------- OVERVIEW --------------------

export function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const headers = authHeaders();

        const [p, s, a, g, f, i] = await Promise.all([
          api.get("/cms/projects?limit=1", { headers }),
          api.get("/cms/sections?limit=1", { headers }),
          api.get("/cms/amenities?limit=1", { headers }),
          api.get("/cms/gallery?limit=1", { headers }),
          api.get("/cms/floorPlans?limit=1", { headers }),
          api.get("/inquiries", { headers })
        ]);

        setStats([
          ["Projects", p.data.total, Building2],
          ["Website Sections", s.data.total, Layers],
          ["Amenities", a.data.total, Layers],
          ["Gallery Images", g.data.total, Image],
          ["Floor Plans", f.data.total, Building2],
          ["Inquiries", i.data.length, Mail]
        ]);
      } catch (err) {
        setError(errorMessage(err));
      }
    }

    load();
  }, []);

  return (
    <div>
      <h2 className="mb-2 font-serif text-3xl">
        Dashboard Overview
      </h2>

      <p className="mb-8 text-gray-500">
        Manage your real estate website from one place.
      </p>

      {error && (
        <p className="text-red-600">{error}</p>
      )}

      {!stats && !error && (
        <p>Loading statistics...</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats?.map(([label, count, Icon]) => (
          <div
            key={label}
            className="rounded-xl bg-white p-7 shadow-sm"
          >
            <Icon
              className="mb-5 text-[#a27b50]"
              size={28}
            />

            <p className="text-sm text-gray-500">
              {label}
            </p>

            <p className="mt-2 text-4xl font-bold">
              {count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------- CONTENT MANAGER --------------------

export function ContentManager() {
  const { type } = useParams();
  const config = configs[type];

  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);

  async function load() {
    if (!config) return;

    setLoading(true);
    setError("");

    try {
      const headers = authHeaders();

      const params = new URLSearchParams({
        limit: "100"
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (filter !== "all") {
        params.set("status", filter);
      }

      const [records, projectResponse] = await Promise.all([
        api.get(`/cms/${type}?${params}`, { headers }),
        api.get("/cms/projects?limit=100", { headers })
      ]);

      setItems(records.data.items);
      setProjects(projectResponse.data.items);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setEditing(null);
    setSearch("");
    setFilter("all");
    setError("");
    setSuccess("");
  }, [type]);

  useEffect(() => {
    load();
  }, [type, filter]);

  if (!config) {
    return <p>Unknown content type.</p>;
  }

  function startCreate() {
    const initial = {};

    config.fields.forEach(field => {
      initial[field] =
        field === "status" ? "draft" : "";
    });

    if (type !== "projects" && projects.length) {
      initial.projectId = projects[0].id;
    }

    setForm(initial);
    setEditing("new");
    setError("");
    setSuccess("");
  }

  function startEdit(item) {
    setForm({ ...item });
    setEditing(item.id);
    setError("");
    setSuccess("");
  }

  // -------------------- FILE UPLOAD --------------------

  async function uploadFile(file, field) {
    if (!file) return;

    const allowedTypes =
      field === "pdfUrl"
        ? ["application/pdf"]
        : ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError(
        field === "pdfUrl"
          ? "Please select a PDF file."
          : "Please select a JPG, PNG, or WebP image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Maximum file size is 5 MB.");
      return;
    }

    setUploadingField(field);
    setError("");
    setSuccess("");

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await api.post(
        "/uploads",
        body,
        {
          headers: authHeaders()
        }
      );

      setForm(previous => ({
        ...previous,
        [field]: response.data.url
      }));

      setSuccess(
        "File uploaded successfully. Click Save Changes."
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploadingField(null);
    }
  }

  // -------------------- SAVE CONTENT --------------------

  async function save(e) {
    e.preventDefault();

    if (uploadingField !== null || saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const data = {};

    config.fields.forEach(field => {
      let value = form[field];

      if (numericFields.includes(field)) {
        value =
          value === "" || value == null
            ? null
            : Number(value);
      } else if (value === "") {
        value = [
          "name", "slug", "title",
          "type", "content", "imageUrl"
        ].includes(field)
          ? ""
          : null;
      }

      data[field] = value;
    });

    if (type === "sections" && data.content == null) {
      data.content = "";
    }

    if (type === "sections" && data.order == null) {
      data.order = 0;
    }

    try {
      const headers = authHeaders();

      if (editing === "new") {
        await api.post(
          `/cms/${type}`,
          data,
          { headers }
        );
      } else {
        await api.patch(
          `/cms/${type}/${editing}`,
          data,
          { headers }
        );
      }

      setEditing(null);

      await load();

      setSuccess("Content saved successfully.");
    } catch (err) {
      setError(
        errorMessage(err) +
        (err.response?.data?.details
          ? " — Check required fields and valid URLs."
          : "")
      );
    } finally {
      setSaving(false);
    }
  }

  // -------------------- DELETE --------------------

  async function remove(item) {
    if (!window.confirm("Delete this record permanently?")) {
      return;
    }

    try {
      await api.delete(
        `/cms/${type}/${item.id}`,
        { headers: authHeaders() }
      );

      await load();

      setSuccess("Record deleted.");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  // -------------------- PUBLISH --------------------

  async function togglePublish(item) {
    try {
      await api.patch(
        `/cms/${type}/${item.id}`,
        {
          status:
            item.status === "published"
              ? "draft"
              : "published"
        },
        { headers: authHeaders() }
      );

      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  // -------------------- DASHBOARD UI --------------------

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl">
            {config.title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create, edit, publish and manage content.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="flex items-center gap-2 rounded bg-[#9e7951] px-5 py-3 text-white"
        >
          <Plus size={18} />
          Add New
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="mb-4 text-green-700">
          {success}
        </p>
      )}

      {/* SEARCH AND FILTER */}

      <div className="mb-5 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") load();
          }}
          placeholder="Search records..."
          className="min-w-0 flex-1 rounded border bg-white p-3"
        />

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="rounded border bg-white p-3"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <button
          onClick={load}
          className="rounded border bg-white px-4 py-3"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* CONTENT TABLE */}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-[#eee7dd]">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name / Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-t">
                <td className="p-4">
                  {item.id}
                </td>

                <td className="p-4 font-medium">
                  {item.name ||
                    item.title ||
                    item.category ||
                    `Record ${item.id}`}
                </td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      item.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="flex flex-wrap gap-2 p-4">
                  <button
                    onClick={() => startEdit(item)}
                    className="rounded bg-blue-50 p-2 text-blue-700"
                    title="Edit"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    onClick={() => togglePublish(item)}
                    className="rounded bg-[#f2ece4] px-3 py-2 text-xs"
                  >
                    {item.status === "published"
                      ? "Unpublish"
                      : "Publish"}
                  </button>

                  <button
                    onClick={() => remove(item)}
                    className="rounded bg-red-50 p-2 text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && items.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            No records found. Click Add New to get started.
          </p>
        )}
      </div>

      {/* ADD / EDIT MODAL */}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={save}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-7 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif text-2xl">
                {editing === "new" ? "Add" : "Edit"}{" "}
                {config.title}
              </h3>

              <button
                type="button"
                disabled={uploadingField !== null || saving}
                onClick={() => setEditing(null)}
              >
                <X size={22} />
              </button>
            </div>

            {error && (
              <p className="mb-4 text-sm text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p className="mb-4 text-sm text-green-700">
                {success}
              </p>
            )}

            {config.fields.map(field => (
              <div key={field} className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  {labels[field] || field}
                </label>

                {field === "status" ? (
                  <select
                    value={form[field] || "draft"}
                    onChange={e =>
                      setForm({
                        ...form,
                        [field]: e.target.value
                      })
                    }
                    className="w-full rounded border p-3"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">
                      Published
                    </option>
                  </select>
                ) : field === "projectId" ? (
                  <select
                    required
                    value={form[field] || ""}
                    onChange={e =>
                      setForm({
                        ...form,
                        [field]: Number(e.target.value)
                      })
                    }
                    className="w-full rounded border p-3"
                  >
                    <option value="">
                      Select Project
                    </option>

                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : [
                  "description",
                  "content",
                  "seoDesc"
                ].includes(field) ? (
                  <textarea
                    rows={4}
                    value={form[field] ?? ""}
                    onChange={e =>
                      setForm({
                        ...form,
                        [field]: e.target.value
                      })
                    }
                    className="w-full rounded border p-3"
                  />
                ) : (
                  <>
                    {/* EXISTING TEXT INPUT */}

                    <input
                      type={
                        numericFields.includes(field)
                          ? "number"
                          : "text"
                      }
                      step={
                        ["carpetArea", "totalArea"].includes(field)
                          ? "any"
                          : "1"
                      }
                      required={[
                        "name",
                        "slug",
                        "title",
                        "type",
                        "imageUrl"
                      ].includes(field)}
                      value={form[field] ?? ""}
                      onChange={e =>
                        setForm({
                          ...form,
                          [field]: e.target.value
                        })
                      }
                      className="w-full rounded border p-3"
                    />

                    {/* NEW FILE UPLOAD OPTION */}

                    {fileFields.includes(field) && (
                      <div className="mt-3 space-y-3">
                        <p className="text-center text-xs text-gray-500">
                          OR upload from your device
                        </p>

                        <div className="rounded-lg border-2 border-dashed border-[#d9c6ad] bg-[#faf8f5] p-4">
                          <label className="mb-2 block text-sm font-medium text-[#9e7951]">
                            {field === "pdfUrl"
                              ? "Choose PDF"
                              : "Choose Image"}
                          </label>

                          <input
                            type="file"
                            disabled={uploadingField !== null || saving}
                            accept={
                              field === "pdfUrl"
                                ? "application/pdf"
                                : "image/jpeg,image/png,image/webp"
                            }
                            onChange={e => {
                              const file = e.target.files?.[0];

                              if (file) {
                                uploadFile(file, field);
                              }

                              e.target.value = "";
                            }}
                            className="w-full text-sm"
                          />

                          <p className="mt-2 text-xs text-gray-500">
                            {field === "pdfUrl"
                              ? "PDF files only"
                              : "JPG, PNG, or WebP"}{" "}
                            — Maximum 5 MB
                          </p>
                        </div>

                        {uploadingField === field && (
                          <p className="text-sm font-medium text-[#9e7951]">
                            Uploading file, please wait...
                          </p>
                        )}

                        {/* IMAGE PREVIEW */}

                        {form[field] &&
                          field !== "pdfUrl" && (
                            <div>
                              <p className="mb-2 text-xs text-gray-500">
                                Image Preview
                              </p>

                              <img
                                src={form[field]}
                                alt="Image preview"
                                className="h-40 w-full rounded-lg border object-contain"
                              />
                            </div>
                          )}

                        {/* PDF PREVIEW LINK */}

                        {form[field] &&
                          field === "pdfUrl" && (
                            <a
                              href={form[field]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 underline"
                            >
                              View Uploaded PDF
                            </a>
                          )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {/* SAVE BUTTON */}

            <button
              type="submit"
              disabled={uploadingField !== null || saving}
              className="flex w-full items-center justify-center gap-2 rounded bg-[#9e7951] p-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />

              {uploadingField !== null
                ? "Uploading..."
                : saving
                  ? "Saving..."
                  : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// -------------------- INQUIRIES --------------------

export function InquiryManager() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const response = await api.get("/inquiries", {
        headers: authHeaders()
      });

      setItems(response.data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(id, status) {
    try {
      await api.patch(
        `/inquiries/${id}`,
        { status },
        { headers: authHeaders() }
      );

      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this inquiry?")) {
      return;
    }

    try {
      await api.delete(
        `/inquiries/${id}`,
        { headers: authHeaders() }
      );

      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div>
      <h2 className="mb-7 font-serif text-3xl">
        Customer Inquiries
      </h2>

      {error && (
        <p className="mb-4 text-red-600">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.id}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {item.email}
                </p>

                <p className="text-sm text-gray-500">
                  {item.phone}
                </p>

                <p className="mt-4">
                  {item.message}
                </p>

                <p className="mt-3 text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <select
                  value={item.status}
                  onChange={e =>
                    changeStatus(item.id, e.target.value)
                  }
                  className="rounded border p-2"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>

                <button
                  onClick={() => remove(item.id)}
                  className="rounded bg-red-50 p-2 text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-gray-500">
            No inquiries yet.
          </p>
        )}
      </div>
    </div>
  );
}

// -------------------- ACTIVITY LOGS --------------------

export function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(
      "/cms/activity-logs",
      { headers: authHeaders() }
    )
      .then(res => setLogs(res.data))
      .catch(err => setError(errorMessage(err)));
  }, []);

  return (
    <div>
      <h2 className="mb-7 font-serif text-3xl">
        Activity Logs
      </h2>

      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[550px] text-left text-sm">
          <thead className="bg-[#eee7dd]">
            <tr>
              <th className="p-4">Action</th>
              <th className="p-4">Entity</th>
              <th className="p-4">Record ID</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t">
                <td className="p-4">
                  {log.action}
                </td>

                <td className="p-4">
                  {log.entity}
                </td>

                <td className="p-4">
                  {log.entityId}
                </td>

                <td className="p-4">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
