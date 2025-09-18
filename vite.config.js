const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Agora que o ficheiro é .cjs, o require.resolve vai funcionar perfeitamente.
      "@react-editor-js/client": require.resolve("@react-editor-js/client"),
      "react-editor-js": require.resolve("react-editor-js"),
    },
  },
});
