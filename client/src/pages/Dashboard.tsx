import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  MessageSquare,
  Phone,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";

// ── Types ────────────────────────────────────────────────────

interface MetricData {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ElementType;
}

interface Inquiry {
  name: string;
  query: string;
  status: "A" | "B" | "C";
}

// ── Static data (defined outside component to avoid re-creation) ──

/** Recent student inquiries shown in the bottom card */
const RECENT_INQUIRIES: Inquiry[] = [
  {
    name: "Jordan JS",
    query: "How do I apply for late enrollment?",
    status: "A",
  },
  {
    name: "Aisha M",
    query: "Housing availability for winter semester",
    status: "A",
  },
  {
    name: "Paul L",
    query: "Requesting transcript for postgrad application",
    status: "B",
  },
];

/** Color coding for inquiry status badges */
const STATUS_COLORS: Record<string, string> = {
  A: "bg-primary",
  B: "bg-secondary",
  C: "bg-muted text-foreground",
};

// ── Sub-components ───────────────────────────────────────────

/**
 * A single metric card in the dashboard grid.
 * Shows an icon, a live count, and a trend label.
 */
function MetricCard({ label, value, trend, trendUp, icon: Icon }: MetricData) {
  return (
    <div className="bg-white rounded-lg p-6 border border-border hover:shadow-md hover:border-primary/20 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground/70">{label}</h3>
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
      </div>

      {/* Metric value */}
      <p className="text-3xl font-bold text-primary mb-1 tabular-nums">{value}</p>

      {/* Trend indicator */}
      <p
        className={`text-xs font-medium ${
          trendUp ? "text-green-600" : "text-foreground/60"
        }`}
      >
        {trendUp ? "↑ " : ""}
        {trend}
      </p>
    </div>
  );
}

/**
 * A single profile field row (label + value with a bottom border).
 */
function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="pb-4 border-b border-border last:border-b-0 last:pb-0">
      <p className="text-xs font-semibold text-foreground/60 mb-1 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-foreground">{value}</p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

/**
 * MTIS Assistant — Dashboard Page
 *
 * Sections:
 *  1. Navbar
 *  2. Page header
 *  3. Live metrics grid (auto-updates every 3 s)
 *  4. Academic profile + Tier card
 *  5. Recent inquiries
 */
export default function Dashboard() {
  // Simulated live metric counters
  const [counts, setCounts] = useState({
    chats: 4281,
    emails: 1104,
    calls: 329,
    students: 50000,
  });

  // Increment counters every 3 seconds to simulate live data
  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) => ({
        ...prev,
        chats: prev.chats + Math.floor(Math.random() * 10),
        emails: prev.emails + Math.floor(Math.random() * 3),
        calls: prev.calls + Math.floor(Math.random() * 2),
      }));
    }, 3000);

    // Cleanup: stop the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  // Build metric data from live counts
  const metrics: MetricData[] = [
    {
      label: "Total Chats",
      value: counts.chats.toLocaleString(),
      trend: "↑ 12.5% from last week",
      trendUp: true,
      icon: MessageSquare,
    },
    {
      label: "Total Emails",
      value: counts.emails.toLocaleString(),
      trend: "This month",
      trendUp: false,
      icon: BarChart3,
    },
    {
      label: "Total Calls",
      value: counts.calls.toLocaleString(),
      trend: "Voice interactions",
      trendUp: false,
      icon: Phone,
    },
    {
      label: "Active Students",
      value: `${(counts.students / 1000).toFixed(0)}k+`,
      trend: "Growing daily",
      trendUp: true,
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── 1. Navigation ─────────────────────────────── */}
      <Navbar currentPage="dashboard" />

      {/* ── 2. Page Content ───────────────────────────── */}
      <main className="container py-12">
        {/* Page header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
          <p className="text-lg text-foreground/70">
            Real-time engagement metrics and academic profile
          </p>
        </header>

        {/* ── 3. Metrics Grid ───────────────────────────── */}
        <section aria-label="Engagement metrics" className="mb-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        {/* ── 4. Profile + Tier ─────────────────────────── */}
        <section
          aria-label="Academic profile"
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {/* Academic Profile Card */}
          <div className="md:col-span-2 bg-white rounded-lg p-6 border border-border">
            <h2 className="text-xl font-bold text-primary mb-6">
              Academic Profile
            </h2>
            <div className="space-y-4">
              <ProfileField label="Name" value="Omar Asran" />
              <ProfileField
                label="Email"
                value="omarasran123@university.edu"
              />
              <ProfileField
                label="Faculty"
                value="Computer Science & Engineering"
              />
              <ProfileField label="Academic Year" value="Senior Year (2024)" />
            </div>
            <Button variant="outline" className="w-full mt-6 hover:border-primary/50">
              Edit Profile
            </Button>
          </div>

          {/* Tier / Membership Card */}
          <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" aria-hidden="true" />
              Membership Tier
            </h3>
            <div className="space-y-4">
              {/* Current tier */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-foreground/60 mb-1">Current Status</p>
                <p className="text-2xl font-bold text-primary">Gold</p>
              </div>

              {/* Progress to next tier */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-foreground/60">Progress to Platinum</p>
                  <p className="text-xs font-bold text-primary">78%</p>
                </div>
                <div
                  className="w-full bg-border rounded-full h-2"
                  role="progressbar"
                  aria-valuenow={78}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="78% progress to Platinum tier"
                >
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: "78%" }}
                  />
                </div>
                <p className="text-xs text-foreground/50 mt-2">
                  22% remaining
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Recent Inquiries ───────────────────────── */}
        <section aria-label="Recent inquiries">
          <div className="bg-white rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">
                Recent Inquiries
              </h2>
              <span className="text-xs text-foreground/50 bg-muted px-2 py-1 rounded-full">
                {RECENT_INQUIRIES.length} entries
              </span>
            </div>

            <div className="space-y-3">
              {RECENT_INQUIRIES.map((inquiry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/20 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {inquiry.name}
                    </p>
                    <p className="text-xs text-foreground/60 truncate mt-0.5">
                      {inquiry.query}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      STATUS_COLORS[inquiry.status] ?? "bg-muted"
                    }`}
                    aria-label={`Status: ${inquiry.status}`}
                  >
                    <span className="text-white text-xs font-bold">
                      {inquiry.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-5 hover:border-primary/50">
              View All Inquiries
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
