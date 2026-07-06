import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  server: {
    port: 5009,
    open: true,
    host: true,
  },
  build: {
    outDir: "dist",
  },
});