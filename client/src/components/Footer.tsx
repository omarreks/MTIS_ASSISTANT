/**
 * Shared site footer.
 *
 * Used by the Home page (and any future page that needs it).
 * The copyright year is always dynamic — it picks up the current year
 * automatically so you never need to update it manually.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border py-12" role="contentinfo">
      <div className="container">
        {/* ── Four-column link grid ────────────────────── */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">MTIS Assistant</h4>
            <p className="text-sm text-foreground/60 leading-relaxed">
              AI intelligence for academia — faster, smarter student support.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-150">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-150">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-150">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-150">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-150">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-150">
                  System Status
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-150">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-150">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors duration-150">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────── */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/60">
          <p>© {currentYear} MTIS Assistant. All rights reserved.</p>
          <p className="text-xs">
            Built for students, by educators.
          </p>
        </div>
      </div>
    </footer>
  );
}
