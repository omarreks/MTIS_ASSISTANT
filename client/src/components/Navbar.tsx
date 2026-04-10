import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Home, LogOut, MessageCircle, LayoutDashboard, LogIn } from "lucide-react";
import { Link, useLocation } from "wouter";

// The pages that can be "active" in the nav
type ActivePage = "home" | "chat" | "dashboard" | "login" | "none";

interface NavbarProps {
  /** Highlight the matching nav link as active */
  currentPage?: ActivePage;
}

/**
 * Shared top navigation bar used by all pages.
 *
 * - Shows the MTIS logo + brand name on the left.
 * - Shows nav links (Home, Chat, Dashboard) on the right.
 * - If the user is logged in: shows Logout button.
 * - If the user is not logged in: shows Login button.
 * - The `currentPage` prop bolds / highlights the active link.
 */
export default function Navbar({ currentPage = "none" }: NavbarProps) {
  const { isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  // Helper: returns extra classes when the link is the current page
  const activeCls = (page: ActivePage) =>
    currentPage === page ? "font-semibold text-primary" : "text-foreground";

  return (
    <nav
      className="sticky top-0 z-50 bg-white border-b border-border shadow-sm"
      aria-label="Main navigation"
    >
      <div className="container flex items-center justify-between py-4">
        {/* ── Logo + Brand ─────────────────────────────── */}
        <Link href="/" aria-label="Go to home">
          <div className="flex items-center gap-2 cursor-pointer select-none">
            <div
              className="w-10 h-10 bg-primary rounded flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">
              MTIS Assistant
            </span>
          </div>
        </Link>

        {/* ── Navigation Links + Auth ───────────────────── */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Home */}
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 hidden sm:inline-flex ${activeCls("home")}`}
              aria-current={currentPage === "home" ? "page" : undefined}
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>

          {/* Chat */}
          <Link href="/chat">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 ${activeCls("chat")}`}
              aria-current={currentPage === "chat" ? "page" : undefined}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </Button>
          </Link>

          {/* Dashboard */}
          <Link href="/dashboard">
            <Button
              variant={currentPage === "dashboard" ? "default" : "ghost"}
              size="sm"
              className={`gap-1.5 ${
                currentPage === "dashboard"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : activeCls("dashboard")
              }`}
              aria-current={currentPage === "dashboard" ? "page" : undefined}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-border hidden sm:block" aria-hidden="true" />

          {/* Auth Button */}
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-foreground hover:text-destructive"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 ${activeCls("login")}`}
                aria-current={currentPage === "login" ? "page" : undefined}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
