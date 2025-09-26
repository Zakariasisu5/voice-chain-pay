import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
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
  define: (() => {
    // Detect if optional packages are installed and expose flags to the app
    const hasWagmi = fs.existsSync(path.resolve(__dirname, 'node_modules', 'wagmi'))
    const hasWeb3Modal = fs.existsSync(path.resolve(__dirname, 'node_modules', '@web3modal', 'wagmi'))
    return {
      __HAS_WAGMI__: JSON.stringify(hasWagmi),
      __HAS_WEB3MODAL__: JSON.stringify(hasWeb3Modal)
    }
  })(),
}));
