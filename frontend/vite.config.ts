import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "^/\\d+/runs": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
        bypass: (req) => (req.headers.accept?.includes("text/html") ? "/index.html" : undefined),
      },
      "/login": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
        bypass: (req) => (req.headers.accept?.includes("text/html") ? "/index.html" : undefined),
      },
      "/create_user": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
      },
      "/users": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
      },
      "/delete_user": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
      },
      "/experiments": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
        bypass: (req) => (req.headers.accept?.includes("text/html") ? "/index.html" : undefined),
      },
      "/run": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
      },
      "/runs": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
      },
      "/admin": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        autoRewrite: true,
        bypass: (req) => (req.headers.accept?.includes("text/html") ? "/index.html" : undefined),
      },
    },
  },
})
