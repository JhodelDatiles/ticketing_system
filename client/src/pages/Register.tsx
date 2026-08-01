import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth-context";
import { getErrorMessage } from "../lib/api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      navigate("/");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm bg-base-100 shadow-md p-6 gap-4">
        <h1 className="text-xl font-semibold">Create account</h1>

        <label className="form-control">
          <span className="label-text">First name</span>
          <input className="input input-bordered w-full" value={form.first_name} onChange={handleChange("first_name")} required />
        </label>

        <label className="form-control">
          <span className="label-text">Last name</span>
          <input className="input input-bordered w-full" value={form.last_name} onChange={handleChange("last_name")} required />
        </label>

        <label className="form-control">
          <span className="label-text">Email</span>
          <input type="email" className="input input-bordered w-full" value={form.email} onChange={handleChange("email")} required />
        </label>

        <label className="form-control">
          <span className="label-text">Password</span>
          <input type="password" className="input input-bordered w-full" value={form.password} onChange={handleChange("password")} required />
        </label>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>

        <p className="text-sm text-center">
          Already have an account? <Link to="/login" className="link link-primary">Sign in</Link>
        </p>
      </form>
    </div>
  );
}