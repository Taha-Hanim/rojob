import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { stripeDevApi } from "./vite.stripe-plugin";
import { salesSheetDevApi } from "./vite.sales-plugin";

// Default "/" for Vercel / custom domain (rojob.eu)
// GitHub Pages workflow sets VITE_BASE=/rojob/
export default defineConfig({
  plugins: [react(), salesSheetDevApi(), stripeDevApi()],
  base: process.env.VITE_BASE || "/",
});
