import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EVENT_FILES = ["Event-1.png", "Event-2.png", "Event-3.png"];

function syncBulkEventImages() {
  const sourceDir = path.resolve(__dirname, "../mobile-app/assets");
  const targetDir = path.resolve(__dirname, "public/highlight");

  fs.mkdirSync(targetDir, { recursive: true });

  for (const file of EVENT_FILES) {
    const src = path.join(sourceDir, file);
    const dest = path.join(targetDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }
}

function bulkEventImageSyncPlugin() {
  return {
    name: "bulk-event-image-sync",
    buildStart() {
      syncBulkEventImages();
    },
    configureServer(server) {
      syncBulkEventImages();

      const watchFiles = EVENT_FILES.map((file) =>
        path.resolve(__dirname, "../mobile-app/assets", file)
      );
      server.watcher.add(watchFiles);

      const maybeSync = (changedPath) => {
        if (!EVENT_FILES.includes(path.basename(changedPath))) return;
        syncBulkEventImages();
        server.ws.send({ type: "full-reload" });
      };

      server.watcher.on("add", maybeSync);
      server.watcher.on("change", maybeSync);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), bulkEventImageSyncPlugin()],
});
