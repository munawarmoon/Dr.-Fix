import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import "../css/signup.css";
import { Eye, EyeOff, Home, Wrench } from "lucide-react";
/**
 * Signup
 * ------
 * Two-step-in-one page:
 *  1. Role selection ("I Need a Service" vs "I Provide Services")
 *  2. Registration form (name, email, phone, password)
 *
 * On successful submit, calls POST /api/register, then routes to /otp
 * carrying the email in router state so the Otp page knows who to verify.
 */

const ROLES = [
  {
    id: "customer",
    icon: Home,
    title: "I Need a Service",
    desc: "Book trusted home experts for repairs and maintenance",
  },
  {
    id: "provider",
    icon: Wrench,
    title: "I Provide Services",
    desc: "Join as a verified technician and grow your business",
  },
];

function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const updateField = (field) => (e) => {
    const value = field === "agreed" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({ role, ...form });
      // Backend has emailed the OTP by this point — move to the OTP screen.
      navigate("/otp", { state: { email: form.email } });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-wrap">
        <h1 className="signup-heading">Join Dr.-Fix</h1>
        <p className="signup-subtext">Choose how you want to get started</p>

        <div className="signup-roles">
          {ROLES.map((r) => {
            const Icon = r.icon;

            return (
              <button
                key={r.id}
                type="button"
                className={`role-card ${role === r.id ? "is-selected" : ""}`}
                onClick={() => setRole(r.id)}
              >
                {role === r.id && (
                  <span className="role-card__check" aria-hidden="true">
                    ✓
                  </span>
                )}

                <span className="role-card__icon">
                  <Icon size={32} />
                </span>

                <span className="role-card__title">{r.title}</span>
                <span className="role-card__desc">{r.desc}</span>
              </button>
            );
          })}
        </div>

        {error && <p className="signup-error">{error}</p>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-form__grid">
            <label className="signup-field">
              <span className="signup-field__label">Full Name</span>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={updateField("fullName")}
              />
            </label>

            <label className="signup-field">
              <span className="signup-field__label">Email Address</span>
              <input
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={updateField("email")}
              />
            </label>

            <label className="signup-field">
              <span className="signup-field__label">Phone Number</span>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={updateField("phone")}
              />
            </label>

            <label className="signup-field">
              <span className="signup-field__label">Password</span>
              <div className="signup-field__password">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={updateField("password")}
                />
                <button
                  type="button"
                  className="signup-field__toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye size={20} color="#000000" />
                  ) : (
                    <EyeOff size={20} color="#000000" />
                  )}
                </button>
              </div>
            </label>
          </div>

          <label className="signup-field">
            <span className="signup-field__label">Confirm Password</span>
            <div className="signup-field__password">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={updateField("confirmPassword")}
              />
              <button
                type="button"
                className="signup-field__toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <Eye size={20} color="#000000" />
                ) : (
                  <EyeOff size={20} color="#000000" />
                )}
              </button>
            </div>
          </label>

          <label className="signup-terms">
            <input
              type="checkbox"
              checked={form.agreed}
              onChange={updateField("agreed")}
            />
            <span>
              I agree to <a href="/terms">Terms &amp; Conditions</a>
            </span>
          </label>

          <button
            type="submit"
            className="signup-submit"
            disabled={!form.agreed || submitting}
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="signup-login-hint">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
