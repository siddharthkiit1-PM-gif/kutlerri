/**
 * Gemini client — single source of truth for model selection.
 * V1 uses gemini-2.0-flash for cost + latency; swap here to upgrade.
 */
import { google } from "@ai-sdk/google";

export const MODEL_ID = "gemini-2.5-flash";

export const geminiModel = google(MODEL_ID);
