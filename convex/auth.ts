/**
 * Convex Auth entry point.
 *
 * V2: Password provider only (email + password sign-up / sign-in).
 * No email-delivery dependency, works the moment it's deployed.
 * Add OAuth or OTP providers here later.
 */
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});
