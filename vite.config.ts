import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: "modern-compiler" },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunk for the framework code every page needs. It only
        // changes when dependencies change, so browsers keep it cached across deploys.
        // (Kept as one chunk: splitting React and Radix apart causes a load-order cycle.)
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|@remix-run|@radix-ui)[\\/]/.test(id)) {
            return "vendor";
          }
        },
      },
    },
  },
}));
