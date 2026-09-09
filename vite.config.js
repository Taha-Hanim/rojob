import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Default "/" for Vercel / custom domain (rojob.eu)
// GitHub Pages workflow sets VITE_BASE=/rojob/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || "/",
});
