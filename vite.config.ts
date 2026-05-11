import { defineConfig } from "@sark_template.dev/vite-tanstack-config";


export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
