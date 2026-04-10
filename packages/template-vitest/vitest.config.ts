import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config.js";
import koobooPlugin from "@kooboo/vitest-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.spec.ts"],
    setupFiles: ["tests/kooboo.setup.ts"],
  },
  plugins: [koobooPlugin()],
});
