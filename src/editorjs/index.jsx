import React, { useCallback, useEffect, useRef } from "react";
import { createReactEditorJS } from "react-editor-js";

// Ferramentas do Editor.js
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";
import ImageTool from "@editorjs/image";
import LinkTool from "@editorjs/link";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import Undo from "editorjs-undo";

import "./styles.css";

// --- ÍCONES ---
const Icons = {
  undo: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88c3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
      />
    </svg>
  ),
  redo: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5c1.96 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"
      />
    </svg>
  ),
  print: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM16 19H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM18 3H6v4h12V3z"
      />
    </svg>
  ),
  header: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="currentColor" d="M5 4v3h5.5v12h3V7H19V4H5z" />
    </svg>
  ),
  list: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5S5.5 6.83 5.5 6S4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"
      />
    </svg>
  ),
  quote: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"
      />
    </svg>
  ),
  image: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
      />
    </svg>
  ),
};

const HOLDER_ID = "editorjs-container";

const EDITOR_JS_TOOLS = {
  paragraph: { class: Paragraph, inlineToolbar: true },
  header: {
    class: Header,
    inlineToolbar: true,
    config: {
      placeholder: "Digite um título...",
      levels: [1, 2, 3],
      defaultLevel: 2,
    },
  },
  list: { class: List, inlineToolbar: true },
  quote: {
    class: Quote,
    inlineToolbar: true,
    config: {
      quotePlaceholder: "Digite uma citação",
      captionPlaceholder: "Autor",
    },
  },
  image: {
    class: ImageTool,
    config: {
      uploader: {
        uploadByFile(file) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({ success: 1, file: { url: event.target.result } });
            };
            reader.readAsDataURL(file);
          });
        },
      },
    },
  },
  linkTool: LinkTool,
  marker: Marker,
  inlineCode: InlineCode,
};

const ReactEditorJS = createReactEditorJS();

function EditorJSComponent() {
  const editorCore = useRef(null);
  const undoPlugin = useRef(null);
  const imageInputRef = useRef(null);

  const handleInitialize = useCallback((instance) => {
    editorCore.current = instance;
  }, []);

  const handleReady = useCallback(() => {
    if (editorCore.current) {
      undoPlugin.current = new Undo({ editor: editorCore.current });
    }
  }, []);

  const handleUndo = () => undoPlugin.current?.undo();
  const handleRedo = () => undoPlugin.current?.redo();
  const handlePrint = () => window.print();

  const addBlock = (type, data = {}) => {
    if (editorCore.current) {
      editorCore.current.blocks.insert(type, data, {}, undefined, true);
    }
  };

  const handleAddHeader = () =>
    addBlock("header", { text: "Novo Título", level: 2 });
  const handleAddList = () =>
    addBlock("list", { style: "unordered", items: ["Item 1"] });
  const handleAddQuote = () =>
    addBlock("quote", { text: "Citação", caption: "Autor" });

  const handleAddImageClick = () => {
    imageInputRef.current?.click();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          addBlock("image", { file: { url: e.target.result } });
        }
      };
      reader.readAsDataURL(file);
    }
    // Limpa o input para permitir o upload do mesmo arquivo novamente
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  return (
    <div className="editor-container">
      <div
        className="editor-content"
        style={{ marginTop: 20, height: "100vh" }}
      >
        <ReactEditorJS
          onInitialize={handleInitialize}
          onReady={handleReady}
          tools={EDITOR_JS_TOOLS}
          holder={HOLDER_ID}
          defaultValue={{
            time: new Date().getTime(),
            blocks: [
              {
                id: "initial-header",
                type: "header",
                data: { text: "Comece a Escrever seu Documento", level: 2 },
              },
              {
                id: "initial-paragraph",
                type: "paragraph",
                data: {
                  text: "Use a tecla <b>Tab</b> ou selecione um texto para ver as opções de formatação.",
                },
              },
            ],
          }}
        >
          <div id={HOLDER_ID} className="editor-input" />
        </ReactEditorJS>
      </div>
    </div>
  );
}

export default EditorJSComponent;
