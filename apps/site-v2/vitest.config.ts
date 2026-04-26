import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    exclude: [
      "node_modules",
      ".next",
      "e2e",                    // Playwright tests — not Vitest
      "**/*.spec.ts",           // Playwright convention
      "**/*.e2e.ts",
    ],
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
    ],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
})
