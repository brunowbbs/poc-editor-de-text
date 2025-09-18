import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Esta é a forma correta e robusta de criar um alias.
      // require.resolve encontra o caminho completo para o ficheiro principal do pacote,
      // garantindo que nunca teremos o erro "file not found".
      "@react-editor-js/client": require.resolve("@react-editor-js/client"),
      "react-editor-js": require.resolve("react-editor-js"),
    },
  },
});
