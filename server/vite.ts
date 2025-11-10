import type { Express } from "express";
import path from "node:path";
import fs from "node:fs";
import express from "express";

export function log(...args: any[]) {
  console.log("[ui]", ...args);
}

/**
 * Development: attach Vite dev server as middleware so you can visit http://localhost:5173
 * Production: serve prebuilt assets from client/dist
 */
export async function setupVite(app: Express, _server: any) {
  if (app.get("env") !== "development") return;

  try {
    const vite = await import("vite") as typeof import("vite");
    const viteServer = await vite.createServer({
      root: path.resolve(process.cwd(), "client"),
      appType: "spa",
      server: { middlewareMode: true, hmr: false },
    });
    app.use(viteServer.middlewares);
    log("Vite dev middleware mounted (client/)");
  } catch (err) {
    console.warn("[ui] Vite dev middleware unavailable:", (err as Error).message);
  }
}

/**
 * In production, serve the built client (client/dist).
 * This is safe to call in all environments; it only serves if the folder exists.
 */
export function serveStatic(app: Express) {
  const distDir = path.resolve(process.cwd(), "client", "dist");
  const indexHtml = path.join(distDir, "index.html");

  if (!fs.existsSync(distDir)) {
    log("client/dist not found; GUI will not be served in production");
    return;
  }

  app.use(express.static(distDir));
  app.get("*", (_req, res) => {
    res.sendFile(indexHtml);
  });
  log(`Serving static GUI from ${distDir}`);
}
