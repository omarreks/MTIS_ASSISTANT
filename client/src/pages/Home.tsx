import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  MessageCircle,
  Mail,
  Phone,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

/**
 * MTIS Assistant — Landing / Home Page
 *
 * Sections:
 *  1. Navbar (shared component)
 *  2. Hero — headline, CTA buttons, stats
 *  3. Features — four communication channels
 *  4. Benefits — why choose MTIS
 *  5. Call-to-action banner
 *  6. Footer (shared component)
 */

// ── Static data defined outside the component so it doesn't re-create on every render ──

const CHANNELS = [
  {
    icon: MessageCircle,
    title: "AI Chatbot",
    description: "Real-time web chat for instant answers to academic questions.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Mobile-first support directly in your messaging app.",
  },
  {
    icon: Mail,
    title: "Email",
    description: "Formal inquiries and policy summaries via email.",
  },
  {
    icon: Phone,
    title: "Voice",
    description: "Hands-free support via high-fidelity voice calls.",
  },
] as const;

const BENEFITS = [
  {
    icon: BarChart3,
    title: "Verified Accuracy",
    description:
      "Linked directly to university systems. All information is accurate and current.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Enterprise-grade encryption. Your data is secure and private at all times.",
  },
  {
    icon: Zap,
    title: "Instant Responses",
    description:
      "Real-time AI categorization and smart routing to the right department.",
  },
] as const;

const STATS = [
  { value: "50k+", label: "Active Students" },
  { value: "4,281", label: "Daily Interactions" },
  { value: "24/7", label: "Support Available" },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── 1. Navigation ─────────────────────────────── */}
      <Navbar currentPage="home" />

      <main className="flex-1">
        {/* ── 2. Hero Section ───────────────────────────── */}
        <section
          className="bg-gradient-to-b from-primary/5 to-transparent py-20 md:py-32"
          aria-labelledby="hero-heading"
        >
          <div className="container">
            <div className="max-w-3xl">
              <h1
                id="hero-heading"
                className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight"
              >
                AI-Powered Campus Intelligence
              </h1>
              <p className="text-xl text-foreground/80 mb-8 leading-relaxed">
                Intelligent university support across chat, email, WhatsApp, and
                voice. Instant answers, smart routing, and verified accuracy.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/chat">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
                  >
                    Start Chat
                    <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5 w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 sm:gap-12 mt-12 pt-8 border-t border-border">
                {STATS.map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-3xl font-bold text-primary">{value}</p>
                    <p className="text-sm text-foreground/60 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Features Section ───────────────────────── */}
        <section className="py-20" aria-labelledby="features-heading">
          <div className="container">
            <h2
              id="features-heading"
              className="text-4xl font-bold text-primary mb-12"
            >
              Four Communication Channels
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CHANNELS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white rounded-lg p-6 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Benefits Section ───────────────────────── */}
        <section
          className="bg-white py-20 border-t border-border"
          aria-labelledby="benefits-heading"
        >
          <div className="container">
            <h2
              id="benefits-heading"
              className="text-4xl font-bold text-primary mb-12"
            >
              Why Choose MTIS Assistant
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {BENEFITS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="space-y-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. CTA Banner ─────────────────────────────── */}
        <section className="bg-primary text-white py-20">
          <div className="container text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students using MTIS Assistant for smarter, faster
              academic support.
            </p>
            <Link href="/chat">
              <Button
                size="lg"
                className="bg-white hover:bg-white/90 text-primary font-semibold mt-2"
              >
                Start Now
                <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* ── 6. Footer ─────────────────────────────────── */}
      <Footer />
    </div>
  );
}
