import { defineConfig } from "vite";

/**
 * Vite config without top-level await.
 * Plugins are loaded via dynamic import inside an async config function
 * so CJS transforms won't choke during build.
 */
export default defineConfig(async () => {
  const plugins = [] as any[];

  // Each plugin is optional. If not installed or ESM-only under CJS load, we ignore it.
  try {
    const mod = await import("@replit/vite-plugin-runtime-error-modal");
    const plugin = mod.default ?? mod;
    if (typeof plugin === "function") plugins.push(plugin());
  } catch {}

  try {
    const mod = await import("@replit/vite-plugin-cartographer");
    const plugin = mod.default ?? mod;
    if (typeof plugin === "function") plugins.push(plugin());
  } catch {}

  try {
    const mod = await import("@replit/vite-plugin-dev-banner");
    const plugin = mod.default ?? mod;
    if (typeof plugin === "function") plugins.push(plugin());
  } catch {}

  return {
    plugins,
  };
});
