/**
 * Next.js middleware — auth gate.
 *
 * Unauthenticated requests to any app route get redirected to /sign-in.
 * Authenticated requests landing on /sign-in get bounced into the app.
 */
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/sign-in"]);
const isProtected = createRouteMatcher([
  "/",
  "/agent-log",
  "/card/:path*",
  "/catering/:path*",
  "/insights/:path*",
  "/settings/:path*",
  "/onboarding/:path*",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthed = await convexAuth.isAuthenticated();
  if (isSignInPage(request) && isAuthed) {
    return nextjsMiddlewareRedirect(request, "/");
  }
  if (isProtected(request) && !isAuthed) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
