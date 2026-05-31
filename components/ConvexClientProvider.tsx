"use client";
/**
 * Convex provider. Gracefully no-ops when NEXT_PUBLIC_CONVEX_URL is not set
 * so local dev / prototype-only builds keep working before `npx convex dev`
 * has been run once to populate the deployment URL.
 */
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { useMemo, type ReactNode } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const client = useMemo(() => (url ? new ConvexReactClient(url) : null), [url]);
  if (!client) return <>{children}</>;
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
