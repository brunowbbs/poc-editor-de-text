import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Lexical from "./lexical";
import EditorJSComponent from "./editorjs/index.jsx";
import QuillJs from "./quilljs/index.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/lexical" element={<Lexical />} />
      <Route path="/editorjs" element={<EditorJSComponent />} />
      <Route path="/quilljs" element={<QuillJs />} />
    </Routes>
  </BrowserRouter>
);
