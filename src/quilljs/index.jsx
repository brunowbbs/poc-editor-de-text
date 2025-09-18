import React, { useCallback, useRef, useState } from "react";
import Quill from "quill";
import ImageResize from "quill-image-resize-module-react";
import "quill/dist/quill.snow.css";
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
  bold: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79c0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79c0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"
      />
    </svg>
  ),
  italic: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"
      />
    </svg>
  ),
  underline: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zM5 19v2h14v-2H5z"
      />
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
  image: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
      />
    </svg>
  ),
  alignLeft: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"
      />
    </svg>
  ),
  alignCenter: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"
      />
    </svg>
  ),
  alignRight: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"
      />
    </svg>
  ),
};

Quill.register("modules/imageResize", ImageResize);

function QuillEditorComponent() {
  const quillRef = useRef(null);
  const [formats, setFormats] = useState({});

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: false,
        history: { delay: 500, maxStack: 100, userOnly: true },
        imageResize: {
          parchment: Quill.import("parchment"),
          modules: ["Resize", "DisplaySize"],
        },
      },
    });

    quillRef.current = q;

    const Delta = Quill.import("delta");
    q.setContents(
      new Delta()
        .insert("Comece a Escrever seu Documento", { header: 2 })
        .insert("\n\n")
        .insert(
          "Use os botões da barra de ferramentas para formatar seu texto."
        )
        .insert("\n")
    );

    q.on("selection-change", (range) => {
      if (range) {
        setFormats(q.getFormat(range.index, range.length));
      } else {
        setFormats({}); // Limpa os formatos se não houver seleção
      }
    });
  }, []);

  const handleFormat = (type, value) => {
    if (quillRef.current) {
      quillRef.current.format(type, value);
    }
  };

  const handleImage = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (file && /^image\//.test(file.type)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const range = quillRef.current.getSelection(true);
          quillRef.current.insertEmbed(
            range.index,
            "image",
            e.target.result,
            Quill.sources.USER
          );
        };
        reader.readAsDataURL(file);
      }
    };
  };

  const handleUndo = () => quillRef.current?.history.undo();
  const handleRedo = () => quillRef.current?.history.redo();
  const handlePrint = () => {
    const content = quillRef.current?.root.innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Documento</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 40px; max-width: 850px; }
            .ql-align-center { text-align: center; } .ql-align-right { text-align: right; } .ql-align-justify { text-align: justify; }
            blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 16px; }
            .ql-size-small { font-size: 0.75em; } .ql-size-large { font-size: 1.5em; } .ql-size-huge { font-size: 2.5em; }
            img { max-width: 100%; display: block; margin-left: auto; margin-right: auto; }
            img.ql-align-left { float: left; margin-right: 1em; }
            img.ql-align-right { float: right; margin-left: 1em; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="editor-container">
      <div className="toolbar">
        <button onClick={handleUndo} title="Desfazer">
          {Icons.undo}
        </button>
        <button onClick={handleRedo} title="Refazer">
          {Icons.redo}
        </button>
        <button onClick={handlePrint} title="Imprimir">
          {Icons.print}
        </button>
        <div className="divider" />
        <select
          value={formats.header || ""}
          onChange={(e) => handleFormat("header", e.target.value || false)}
        >
          <option value="1">Título 1</option>
          <option value="2">Título 2</option>
          <option value="3">Título 3</option>
          <option value="">Normal</option>
        </select>
        <select
          value={formats.size || "false"}
          onChange={(e) =>
            handleFormat(
              "size",
              e.target.value === "false" ? false : e.target.value
            )
          }
        >
          <option value="small">Pequeno</option>
          <option value="false">Normal</option>
          <option value="large">Grande</option>
          <option value="huge">Enorme</option>
        </select>
        <div className="divider" />
        <input
          type="color"
          value={formats.color || "#000000"}
          onChange={(e) => handleFormat("color", e.target.value)}
        />
        <div className="divider" />
        <button
          onClick={() => handleFormat("bold", !formats.bold)}
          className={formats.bold ? "active" : ""}
          title="Negrito"
        >
          {Icons.bold}
        </button>
        <button
          onClick={() => handleFormat("italic", !formats.italic)}
          className={formats.italic ? "active" : ""}
          title="Itálico"
        >
          {Icons.italic}
        </button>
        <button
          onClick={() => handleFormat("underline", !formats.underline)}
          className={formats.underline ? "active" : ""}
          title="Sublinhado"
        >
          {Icons.underline}
        </button>
        <div className="divider" />
        <button
          onClick={() => handleFormat("align", false)}
          className={!formats.align ? "active" : ""}
          title="Alinhar à Esquerda"
        >
          {Icons.alignLeft}
        </button>
        <button
          onClick={() => handleFormat("align", "center")}
          className={formats.align === "center" ? "active" : ""}
          title="Centralizar"
        >
          {Icons.alignCenter}
        </button>
        <button
          onClick={() => handleFormat("align", "right")}
          className={formats.align === "right" ? "active" : ""}
          title="Alinhar à Direita"
        >
          {Icons.alignRight}
        </button>
        <div className="divider" />
        <button
          onClick={() =>
            handleFormat("list", formats.list === "bullet" ? false : "bullet")
          }
          className={formats.list === "bullet" ? "active" : ""}
          title="Lista"
        >
          {Icons.list}
        </button>
        <button onClick={handleImage} title="Imagem">
          {Icons.image}
        </button>
      </div>

      <div className="editor-content">
        <div ref={wrapperRef} className="editor-input-wrapper"></div>
      </div>
    </div>
  );
}

export default QuillEditorComponent;
