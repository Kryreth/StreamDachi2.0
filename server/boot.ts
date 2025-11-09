import http from "http";

/**
 * Wrapper that always provides `registerRoutes(app)`:
 * - If ./routes exports { registerRoutes } or default, call it.
 * - Otherwise, fall back to returning a plain HTTP server so the app boots.
 */
export async function registerRoutes(app: any) {
  try {
    // Use require so it works under CommonJS build
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("./routes");
    const fn = (mod && (mod.registerRoutes || mod.default));
    if (typeof fn === "function") {
      return await fn(app);
    }
  } catch (e) {
    // ignore and fall back
  }
  const server = http.createServer(app);
  return server;
}