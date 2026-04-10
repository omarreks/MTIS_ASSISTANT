/**
 * Re-exports useAuth from the canonical AuthContext.
 *
 * This file exists so that either import path works:
 *   import { useAuth } from "@/_core/hooks/useAuth"   ← (legacy)
 *   import { useAuth } from "@/contexts/AuthContext"   ← (preferred)
 *
 * Both resolve to the same hook — no duplicate state.
 */
export { useAuth } from "@/contexts/AuthContext";
