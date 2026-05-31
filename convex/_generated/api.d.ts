/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as agentRuns from "../agentRuns.js";
import type * as cards from "../cards.js";
import type * as contacts from "../contacts.js";
import type * as crons from "../crons.js";
import type * as email from "../email.js";
import type * as engageThreads from "../engageThreads.js";
import type * as overnight from "../overnight.js";
import type * as seed from "../seed.js";
import type * as signals from "../signals.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  agentRuns: typeof agentRuns;
  cards: typeof cards;
  contacts: typeof contacts;
  crons: typeof crons;
  email: typeof email;
  engageThreads: typeof engageThreads;
  overnight: typeof overnight;
  seed: typeof seed;
  signals: typeof signals;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
