/**
 * Convex Auth provider config — required so Convex trusts its own JWTs.
 * SITE_URL is set automatically by `npx @convex-dev/auth` per deployment.
 */
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
