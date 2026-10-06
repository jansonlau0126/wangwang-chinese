import { cpSync, createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(root, "assets");

function serveAssets() {
  return {
    name: "wangwang-assets",
    configureServer(server) {
      server.middlewares.use("/assets", (req, res, next) => {
        const rel = decodeURIComponent((req.url || "/").split("?")[0]).replace(/^\/+/, "");
        const file = path.resolve(assetsDir, rel);
        if (file !== assetsDir && !file.startsWith(assetsDir + path.sep)) return next();
        if (!existsSync(file) || statSync(file).isDirectory()) return next();
        const types = {
          ".webp": "image/webp",
          ".mp3": "audio/mpeg",
          ".json": "application/json",
          ".txt": "text/plain; charset=utf-8",
        };
        res.setHeader("Content-Type", types[path.extname(file).toLowerCase()] || "application/octet-stream");
        createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      const outDir = path.resolve(root, this.environment?.config?.build?.outDir || "dist");
      // Vite 6: prefer config from plugin context when available
    },
    writeBundle(options) {
      const outDir = options.dir || path.join(root, "dist");
      cpSync(assetsDir, path.join(outDir, "assets"), { recursive: true });
    },
  };
}

export default defineConfig({
  root,
  publicDir: "public",
  plugins: [serveAssets()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
