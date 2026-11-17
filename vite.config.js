import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const base = process.env.GITHUB_PAGES === "true" ? "/branchEye/" : "/";

function rewritePublicPaths() {
  return {
    name: "rewrite-public-paths",
    transform(code, id) {
      if (base === "/" || !/\.[jt]sx?$/.test(id) || id.includes("node_modules")) return;
      if (!code.includes("/figma/") && !code.includes("/logo.svg")) return;
      return code.replace(/(["'`])\/((?:figma\/|logo\.svg))/g, `$1${base}$2`);
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), rewritePublicPaths()],
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
