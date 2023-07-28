import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  test: {
    silent: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
    },
  },
});
