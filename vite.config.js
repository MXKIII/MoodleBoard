import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://10.102.2.24:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/cas": {
        target: "https://sso.inspe-paris.fr",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
