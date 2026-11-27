import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { "/api": { target: "http://127.0.0.1:8000", changeOrigin: true } },
  },
  test: {
    include: ["tests/**/*.{test,spec}.{js,jsx}"],
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
    globals: true,
    css: false,
  },
});
