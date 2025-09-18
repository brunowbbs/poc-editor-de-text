import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Importe o módulo 'path' do Node.js

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Força o Vite a usar a versão de módulo ES (para o navegador) da biblioteca
      "@react-editor-js/client": path.resolve(
        __dirname,
        "node_modules/@react-editor-js/client/dist/react-editor-js-client.mjs"
      ),
      // Adicionar um alias para a biblioteca principal por segurança
      "react-editor-js": path.resolve(
        __dirname,
        "node_modules/react-editor-js/dist/react-editor-js.mjs"
      ),
    },
  },
});
