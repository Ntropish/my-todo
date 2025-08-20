/// <reference types="vitest" />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { reonoClient } from "@reono/client";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.tsx",
      name: "reono-todo-api",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    outDir: "dist",
    rollupOptions: {
      external: [
        "path",
        "fs",
        "child_process",
        "util",
        "yargs/helpers",
        "yargs/yargs",
        "glob",
      ],
    },
  },
  plugins: [
    dts(),
    reonoClient({
      serverFile: "./src/server.tsx",
      outputDir: "./generated",
      clientName: "rest",
      baseUrl: "http://localhost:8082",
    }),
  ],
  test: {},
});
