import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project URL uses /rojob/
// For a custom domain later (rojob.eu), set VITE_BASE=/ when building
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || "/rojob/",
});
