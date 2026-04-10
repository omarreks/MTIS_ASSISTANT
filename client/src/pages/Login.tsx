import { Button } from "@/components/ui/button";
import { useState, useEffect, useId } from "react";
import { Mail, Lock, Shield, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Link } from "wouter";

/**
 * MTIS Assistant — Login Page
 *
 * Authenticates students with their university email + National ID.
 *
 * Improvements over the original:
 * - Uses `useId()` to generate accessible label ↔ input associations
 * - `autoComplete` hints help the browser autofill correctly
 * - Show/hide toggle for the National ID field
 * - Dynamic copyright year
 * - Error alert is properly announced to screen readers (role="alert")
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [showId, setShowId] = useState(false); // toggle National ID visibility
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Unique IDs for label–input associations (React 18 best practice)
  const emailId = useId();
  const idId = useId();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  // Don't render the form if we're about to redirect
  if (isAuthenticated) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // ── Client-side validation ────────────────────────
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    const validDomains = [".edu", ".ac.uk", ".edu.eg"];
    const hasValidDomain = validDomains.some((d) => email.endsWith(d));
    if (!hasValidDomain) {
      setError("Must be a university email (e.g., .edu, .ac.uk, or .edu.eg).");
      setIsSubmitting(false);
      return;
    }

    if (nationalId.length < 10) {
      setError("National ID must be at least 10 digits.");
      setIsSubmitting(false);
      return;
    }

    // ── Submit ────────────────────────────────────────
    try {
      await login(email, nationalId);
      setLocation("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ── Card ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">

          {/* Logo + Title */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-md"
              aria-hidden="true"
            >
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary leading-tight">
                MTIS Assistant
              </h1>
              <p className="text-sm text-foreground/60 mt-1">
                Welcome back, Scholar
              </p>
            </div>
          </div>

          {/* ── Form ──────────────────────────────────────── */}
          <form onSubmit={handleLogin} className="space-y-5" noValidate>

            {/* Error message — role="alert" so screen readers announce it */}
            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3"
              >
                <AlertCircle
                  className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* University Email */}
            <div className="space-y-1.5">
              <label
                htmlFor={emailId}
                className="block text-sm font-semibold text-foreground"
              >
                University Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background/50 text-foreground placeholder-foreground/40 transition"
                />
              </div>
              <p className="text-xs text-foreground/50">
                Must end with .edu, .ac.uk, or .edu.eg
              </p>
            </div>

            {/* National ID */}
            <div className="space-y-1.5">
              <label
                htmlFor={idId}
                className="block text-sm font-semibold text-foreground"
              >
                National ID
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id={idId}
                  type={showId ? "text" : "password"}
                  value={nationalId}
                  onChange={(e) =>
                    setNationalId(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter your National ID"
                  autoComplete="current-password"
                  maxLength={15}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background/50 text-foreground placeholder-foreground/40 transition"
                />
                {/* Show / hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowId((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition"
                  aria-label={showId ? "Hide National ID" : "Show National ID"}
                >
                  {showId ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Security notice */}
            <div className="flex items-center gap-2 bg-primary/5 rounded-lg p-3">
              <Shield
                className="w-4 h-4 text-primary shrink-0"
                aria-hidden="true"
              />
              <p className="text-xs text-foreground/70">
                Your credentials are encrypted and never stored in plain text.
              </p>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isSubmitting || !email || !nationalId}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  Logging in…
                </span>
              ) : (
                "Log In"
              )}
            </Button>
          </form>

          {/* Footer links */}
          <div className="space-y-3 pt-4 border-t border-border text-center">
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 font-medium transition"
            >
              Need help? →
            </button>
            <p className="text-xs text-foreground/50">
              Don't have an account?{" "}
              <a href="#" className="text-primary hover:text-primary/80 font-semibold">
                Register here
              </a>
            </p>
          </div>
        </div>

        {/* Below-card footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-foreground/50">
            © {currentYear} MTIS Assistant. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 text-xs text-foreground/50">
            {["Privacy", "Security", "Support", "Standards"].map((link) => (
              <a
                key={link}
                href="#"
                className="hover:text-primary transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
