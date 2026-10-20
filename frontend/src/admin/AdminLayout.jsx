
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Layers, Image,
  Sparkles, Ruler, Mail, History, LogOut, Menu, X
} from "lucide-react";
import api from "../services/api";

const links = [
  ["Overview", "/admin", LayoutDashboard],
  ["Projects", "/admin/projects", Building2],
  ["Sections", "/admin/sections", Layers],
  ["Amenities", "/admin/amenities", Sparkles],
  ["Gallery", "/admin/gallery", Image],
  ["Floor Plans", "/admin/floorPlans", Ruler],
  ["Inquiries", "/admin/inquiries", Mail],
  ["Activity Logs", "/admin/logs", History]
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => setVerified(true))
      .catch(() => {
        sessionStorage.removeItem("adminToken");
        navigate("/admin/login", { replace: true });
      });
  }, [navigate]);

  function logout() {
    sessionStorage.removeItem("adminToken");
    navigate("/admin/login");
  }

  if (!verified) {
    return <div className="p-10">Checking administrator access...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] md:flex">
      <aside className={`z-40 bg-[#281c16] text-white md:min-h-screen md:w-64 ${menuOpen ? "block" : "hidden"} md:block`}>
        <div className="border-b border-white/10 p-6">
          <h2 className="font-serif text-2xl">ONE CHEMBUR</h2>
          <p className="mt-1 text-xs text-[#c6a77f]">CMS Administration</p>
        </div>

        <nav className="space-y-1 p-4">
          {links.map(([label, path, Icon]) => (
            <Link key={path} to={path}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded px-4 py-3 text-sm hover:bg-white/10">
              <Icon size={18} /> {label}
            </Link>
          ))}

          <button onClick={logout}
            className="mt-6 flex w-full items-center gap-3 rounded px-4 py-3 text-sm text-red-300 hover:bg-white/10">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b bg-white p-5">
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
          <h1 className="font-serif text-xl md:text-2xl">
            Content Management Dashboard
          </h1>
          <Link to="/" className="text-sm text-[#a27b50]">
            View Website
          </Link>
        </div>
        <div className="p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
