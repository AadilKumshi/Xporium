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
      },
      "/login": "http://127.0.0.1:8000",
      "/create_user": "http://127.0.0.1:8000",
      "/users": "http://127.0.0.1:8000",
      "/delete_user": "http://127.0.0.1:8000",
      "/experiments": "http://127.0.0.1:8000",
      "/run": "http://127.0.0.1:8000",
      "/runs": "http://127.0.0.1:8000",
      "/admin": "http://127.0.0.1:8000",
    },
  },
})
