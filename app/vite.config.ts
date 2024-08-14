import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: ["graphql", "login", "logout", "signup"].reduce<Record<string, string>>((proxy, route) => {
        proxy["/" + route] = env.VITE_API_URI;

        return proxy;
      }, {}),
    },
  };
});
