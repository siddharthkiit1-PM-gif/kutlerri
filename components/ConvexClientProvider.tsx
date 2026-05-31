"use client";
/**
 * Convex + Convex Auth client provider.
 *
 * Wraps the app in `ConvexAuthNextjsProvider` so every `useQuery` /
 * `useMutation` flows through the user's auth token. `useAuthActions`,
 * `<Authenticated>`, `<Unauthenticated>`, etc. all work below this.
 *
 * Gracefully no-ops when NEXT_PUBLIC_CONVEX_URL is not set, so static
 * preview builds (no Convex bound) keep rendering.
 */
import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { useMemo, type ReactNode } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const client = useMemo(() => (url ? new ConvexReactClient(url) : null), [url]);
  if (!client) return <>{children}</>;
  return (
    <ConvexAuthNextjsProvider client={client}>{children}</ConvexAuthNextjsProvider>
  );
}
