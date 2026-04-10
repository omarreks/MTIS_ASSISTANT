import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

/**
 * MTIS Assistant — 404 Not Found Page
 *
 * Shown whenever a user navigates to a route that doesn't exist.
 * Uses the project's design system colors (primary, border)
 * instead of hardcoded Tailwind blue values.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-primary/5 p-4">
      <Card className="w-full max-w-lg shadow-lg border border-border bg-white">
        <CardContent className="pt-10 pb-10 text-center">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div
                className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"
                aria-hidden="true"
              />
              <AlertCircle
                className="relative h-16 w-16 text-primary"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Text */}
          <h1 className="text-5xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-foreground/60 mb-8 leading-relaxed max-w-sm mx-auto">
            The page you're looking for doesn't exist. It may have been moved,
            renamed, or deleted.
          </p>

          {/* Actions */}
          <div
            id="not-found-button-group"
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            {/* Go Home — uses Link for semantic navigation */}
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 gap-2">
                <Home className="w-4 h-4" aria-hidden="true" />
                Go Home
              </Button>
            </Link>

            {/* Go Back */}
            <Button
              variant="outline"
              className="px-6 py-2.5 border-primary/30 hover:border-primary text-primary"
              onClick={() => window.history.back()}
            >
              ← Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
