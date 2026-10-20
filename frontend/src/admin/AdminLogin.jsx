
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Building2 } from "lucide-react";
import api from "../services/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password
      });

      sessionStorage.setItem("adminToken", response.data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#251a14] px-4">
      <form onSubmit={handleLogin}
        className="w-full max-w-md rounded-xl bg-white p-9 shadow-2xl">
        <div className="mb-7 text-center">
          <Building2 className="mx-auto mb-4 text-[#a27b50]" size={42} />
          <h1 className="font-serif text-3xl text-[#35271f]">
            Real Estate CMS
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Administrator Login
          </p>
        </div>

        <label className="mb-2 block text-sm">Email</label>
        <input type="email" required value={email}
          onChange={e => setEmail(e.target.value)}
          className="mb-5 w-full rounded border p-3"
          placeholder="admin@example.com" />

        <label className="mb-2 block text-sm">Password</label>
        <input type="password" required value={password}
          onChange={e => setPassword(e.target.value)}
          className="mb-5 w-full rounded border p-3"
          placeholder="Enter your password" />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded bg-[#a27b50] p-3 font-semibold text-white disabled:opacity-50">
          <LockKeyhole size={17} />
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <a href="/" className="mt-6 block text-center text-sm text-[#a27b50]">
          Return to Website
        </a>
      </form>
    </div>
  );
}
