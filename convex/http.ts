/**
 * Mounts Convex Auth's HTTP routes (/api/auth/*) on the convex.site origin.
 */
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

export default http;
