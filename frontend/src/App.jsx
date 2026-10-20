
import { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Menu,
  X,
  ArrowRight,
  Building2,
  Waves,
  Dumbbell,
  Trees,
  ShieldCheck,
} from "lucide-react";

import api from "./services/api";

// Maps icon names stored in PostgreSQL to React icons
const amenityIcons = {
  waves: Waves,
  dumbbell: Dumbbell,
  trees: Trees,
  "shield-check": ShieldCheck,
};

const fallbackImage =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600";

export default function App() {
  // CMS data
  const [project, setProject] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [floorPlans, setFloorPlans] = useState([]);
  const [sections, setSections] = useState([]);

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Inquiry form
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Fetch all published CMS content
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setLoadError("");

        const projectsResponse = await api.get(
          "/cms/projects"
        );

        const projects = projectsResponse.data.items || [];

        const selected =
          projects.find((p) => p.slug === "one-chembur") ||
          projects[0];

        if (!selected) {
          if (active) {
            setLoadError(
              "No published projects are available."
            );
          }
          return;
        }

        const [a, g, f, s] = await Promise.all([
          api.get(
            `/cms/amenities?projectId=${selected.id}`
          ),
          api.get(
            `/cms/gallery?projectId=${selected.id}`
          ),
          api.get(
            `/cms/floorPlans?projectId=${selected.id}`
          ),
          api.get(
            `/cms/sections?projectId=${selected.id}`
          ),
        ]);

        if (!active) return;

        setProject(selected);
        setAmenities(a.data.items || []);
        setGallery(g.data.items || []);
        setFloorPlans(f.data.items || []);
        setSections(s.data.items || []);
      } catch (error) {
        console.error(
          "Failed to load CMS data:",
          error
        );

        if (active) {
          setLoadError(
            "Unable to load project information. Please refresh."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Submit inquiry to Express backend
  async function submitInquiry(e) {
    e.preventDefault();

    if (!project || submitting) return;

    setSubmitting(true);
    setMessage("");

    try {
      await api.post("/inquiries", {
        ...form,
        projectId: project.id,
      });

      setMessage(
        "Thank you! Your inquiry has been submitted."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error(
        "Inquiry submission failed:",
        error
      );

      setMessage(
        "Unable to submit your inquiry. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const navLinks = [
    ["Home", "#home"],
    ["About", "#about"],
    ["Amenities", "#amenities"],
    ["Connectivity", "#connectivity"],
    ["Gallery", "#gallery"],
    ["Floor Plans", "#floorplans"],
    ["Developer", "#developer"],
    ["Contact", "#contact"],
  ];

  const displayAmenities = amenities.length
    ? amenities
    : [
        {
          id: "demo-1",
          name: "Swimming Pool",
          icon: "waves",
        },
        {
          id: "demo-2",
          name: "Fitness Centre",
          icon: "dumbbell",
        },
        {
          id: "demo-3",
          name: "Landscaped Gardens",
          icon: "trees",
        },
        {
          id: "demo-4",
          name: "Secure Living",
          icon: "shield-check",
        },
      ];

  const displayGallery = gallery.length
    ? gallery
    : [
        {
          id: "demo-1",
          title: "Residence",
          imageUrl: fallbackImage,
        },
        {
          id: "demo-2",
          title: "Interiors",
          imageUrl: fallbackImage,
        },
        {
          id: "demo-3",
          title: "Architecture",
          imageUrl: fallbackImage,
        },
      ];

  const displayFloorPlans = floorPlans.length
    ? floorPlans
    : [
        {
          id: "demo-1",
          name: "Sample Residence",
          carpetArea: null,
          totalArea: null,
        },
      ];

  const displaySections = [...sections]
    .filter((section) =>
      ["connectivity", "developer"].includes(
        section.type
      )
    )
    .sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#35271f]">

      {/* NAVIGATION */}
      <header className="fixed top-0 z-50 w-full bg-[#271b15]/95 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <a
            href="#home"
            className="font-serif text-2xl tracking-widest"
          >
            ONE{" "}
            <span className="text-[#d6ae79]">
              CHEMBUR
            </span>
          </a>

          <nav className="hidden gap-5 xl:flex">
            {navLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-sm transition hover:text-[#d6ae79]"
              >
                {label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            className="xl:hidden"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <nav className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto px-6 pb-6 xl:hidden">
            {navLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() =>
                  setMenuOpen(false)
                }
                className="text-sm hover:text-[#d6ae79]"
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* HERO SECTION */}
      <section
        id="home"
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(
            rgba(20,12,8,.55),
            rgba(20,12,8,.70)
          ), url("${project?.heroImage || fallbackImage}")`,
        }}
      >
        <div className="px-6 pt-24 text-center text-white">
          <p className="mb-5 uppercase tracking-[.3em] text-[#e4c39a]">
            A New Standard of Living
          </p>

          <h1 className="mb-6 font-serif text-4xl sm:text-6xl md:text-8xl">
            {project?.name || "One Chembur"}
          </h1>

          <p className="mx-auto mb-9 max-w-2xl text-lg leading-8 text-gray-200">
            Discover timeless elegance,
            refined spaces and an extraordinary
            lifestyle in the heart of Mumbai.
          </p>

          <a
            href="#contact"
            className="inline-flex items-center gap-3 bg-[#b38b5e] px-8 py-4 font-semibold text-white transition hover:bg-[#916b43]"
          >
            ENQUIRE NOW
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* DATA LOADING STATUS */}
      {loading && (
        <div
          role="status"
          className="bg-[#eee7dd] px-6 py-4 text-center"
        >
          Loading project information...
        </div>
      )}

      {loadError && (
        <div
          role="alert"
          className="bg-red-50 px-6 py-4 text-center text-red-700"
        >
          {loadError}
        </div>
      )}

      {/* ABOUT SECTION */}
      <section
        id="about"
        className="scroll-mt-20 px-6 py-24"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">
          <div>
            <p className="mb-3 uppercase tracking-widest text-[#aa8255]">
              Welcome to Excellence
            </p>

            <h2 className="mb-7 font-serif text-4xl md:text-5xl">
              An Address Beyond Ordinary
            </h2>

            <p className="mb-7 leading-8 text-gray-600">
              {project?.description ||
                "Experience a sophisticated lifestyle in thoughtfully designed residences."}
            </p>

            <div className="flex items-center gap-3 text-[#946c43]">
              <MapPin size={20} />
              <span>
                {project?.location ||
                  "Chembur, Mumbai"}
              </span>
            </div>
          </div>

          <img
            src={fallbackImage}
            alt="Premium residential architecture"
            loading="lazy"
            className="h-[460px] w-full object-cover shadow-xl"
          />
        </div>
      </section>

      {/* AMENITIES SECTION */}
      <section
        id="amenities"
        className="scroll-mt-20 bg-[#30221a] px-6 py-24 text-white"
      >
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-center uppercase tracking-widest text-[#d6ae79]">
            Elevated Living
          </p>

          <h2 className="mb-14 text-center font-serif text-4xl">
            World-Class Amenities
          </h2>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {displayAmenities.map((item) => {
              const Icon =
                amenityIcons[item.icon] ||
                Building2;

              return (
                <div
                  key={item.id}
                  className="border border-[#6d5441] p-9 text-center transition hover:bg-[#493529]"
                >
                  <Icon
                    className="mx-auto mb-6 text-[#d6ae79]"
                    size={36}
                  />

                  <h3 className="font-serif text-xl">
                    {item.name}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONNECTIVITY AND DEVELOPER SECTIONS */}
      {displaySections.map((section, index) => (
        <section
          key={section.id}
          id={section.type}
          className={`scroll-mt-20 px-6 py-24 ${
            index % 2 === 0
              ? "bg-white"
              : "bg-[#eee7dd]"
          }`}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">
            <div
              className={
                index % 2
                  ? "md:order-2"
                  : ""
              }
            >
              <p className="mb-4 uppercase tracking-widest text-[#aa8255]">
                {section.type === "connectivity"
                  ? "Perfectly Connected"
                  : "Our Vision"}
              </p>

              <h2 className="mb-7 font-serif text-4xl md:text-5xl">
                {section.title}
              </h2>

              <p className="whitespace-pre-line leading-8 text-gray-600">
                {section.content}
              </p>
            </div>

            {section.imageUrl && (
              <img
                src={section.imageUrl}
                alt={section.title}
                loading="lazy"
                className="h-[400px] w-full object-cover shadow-lg"
              />
            )}
          </div>
        </section>
      ))}

      {/* GALLERY SECTION */}
      <section
        id="gallery"
        className="scroll-mt-20 px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-center uppercase tracking-widest text-[#aa8255]">
            A Glimpse of Luxury
          </p>

          <h2 className="mb-12 text-center font-serif text-4xl">
            Project Gallery
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {displayGallery.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden"
              >
                <div className="overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={
                      item.title ||
                      "Project Gallery"
                    }
                    loading="lazy"
                    className="h-80 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <p className="mt-3 font-serif text-lg">
                  {item.title}
                </p>

                {item.category && (
                  <p className="mt-1 text-sm text-gray-500">
                    {item.category}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOOR PLANS SECTION */}
      <section
        id="floorplans"
        className="scroll-mt-20 bg-[#eee7dd] px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-center uppercase tracking-widest text-[#aa8255]">
            Crafted for Comfort
          </p>

          <h2 className="mb-12 text-center font-serif text-4xl">
            Thoughtfully Designed Floor Plans
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {displayFloorPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white p-8 shadow-sm"
              >
                {plan.imageUrl ? (
                  <img
                    src={plan.imageUrl}
                    alt={plan.name}
                    loading="lazy"
                    className="mb-6 h-52 w-full object-contain"
                  />
                ) : (
                  <div className="mb-6 flex h-52 items-center justify-center bg-[#f2ece4]">
                    <Building2
                      size={60}
                      className="text-[#aa8255]"
                    />
                  </div>
                )}

                <h3 className="mb-3 font-serif text-2xl">
                  {plan.name}
                </h3>

                {plan.carpetArea != null && (
                  <p className="mb-2 text-gray-600">
                    Carpet Area:{" "}
                    {plan.carpetArea} sq. ft.
                  </p>
                )}

                {plan.totalArea != null && (
                  <p className="text-gray-600">
                    Total Area:{" "}
                    {plan.totalArea} sq. ft.
                  </p>
                )}

                {plan.pdfUrl && (
                  <a
                    href={plan.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 text-[#916b43] underline"
                  >
                    View Floor Plan
                    <ArrowRight size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section
        id="contact"
        className="scroll-mt-20 px-6 py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-2">
          <div>
            <p className="mb-4 uppercase tracking-widest text-[#aa8255]">
              Get in Touch
            </p>

            <h2 className="mb-7 font-serif text-5xl">
              Begin Your Journey Home
            </h2>

            <p className="mb-8 leading-8 text-gray-600">
              Interested in learning more?
              Send us an inquiry and our team
              will get in touch with you.
            </p>

            <div className="space-y-5">
              <p className="flex items-center gap-3">
                <MapPin />
                {project?.location ||
                  "Chembur, Mumbai"}
              </p>

              <p className="flex items-center gap-3">
                <Phone />
                Contact details available
                on request
              </p>

              <p className="flex items-center gap-3">
                <Mail />
                Submit the inquiry form
              </p>
            </div>
          </div>

          <form
            onSubmit={submitInquiry}
            className="space-y-5 bg-white p-8 shadow-lg"
          >
            <h3 className="font-serif text-2xl">
              Enquire Now
            </h3>

            <input
              type="text"
              placeholder="Full Name"
              required
              maxLength={100}
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full border border-gray-300 p-4 outline-none focus:border-[#aa8255]"
            />

            <input
              type="email"
              placeholder="Email Address"
              required
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className="w-full border border-gray-300 p-4 outline-none focus:border-[#aa8255]"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              className="w-full border border-gray-300 p-4 outline-none focus:border-[#aa8255]"
            />

            <textarea
              placeholder="Your Message"
              required
              rows={4}
              value={form.message}
              onChange={(e) =>
                setForm({
                  ...form,
                  message: e.target.value,
                })
              }
              className="w-full border border-gray-300 p-4 outline-none focus:border-[#aa8255]"
            />

            <button
              type="submit"
              disabled={submitting || !project}
              className="w-full bg-[#9e7951] py-4 font-semibold text-white transition hover:bg-[#7f5d3b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "SUBMITTING..."
                : "SUBMIT INQUIRY"}
            </button>

            {message && (
              <p
                role="status"
                className="text-sm text-[#765536]"
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#271b15] px-6 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="font-serif text-2xl tracking-widest">
              ONE CHEMBUR
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Premium Real Estate CMS Demonstration
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#home" className="hover:text-[#d6ae79]">
              Home
            </a>
            <a href="#about" className="hover:text-[#d6ae79]">
              About
            </a>
            <a href="#amenities" className="hover:text-[#d6ae79]">
              Amenities
            </a>
            <a href="#contact" className="hover:text-[#d6ae79]">
              Contact
            </a>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} One Chembur.
          Demonstration project. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
