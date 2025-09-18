import { CodeHighlightNode, CodeNode } from "@lexical/code";
import {
  $isLinkNode,
  AutoLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
  $wrapNodes,
} from "@lexical/selection";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  // --- IMPORT CORRIGIDO AQUI ---
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRangeSelection,
  createCommand,
  DecoratorNode,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INSERT_LINE_BREAK_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
  KEY_DOWN_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
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
  strikethrough: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"
      />
    </svg>
  ),
  code: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6l6 6l1.4-1.4zm5.2 0l4.6-4.6l-4.6-4.6L16 6l6 6l-6 6l-1.4-1.4z"
      />
    </svg>
  ),
  link: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
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
  ul: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5S5.5 6.83 5.5 6S4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"
      />
    </svg>
  ),
  ol: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 11.9V11H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"
      />
    </svg>
  ),
};

// --- LÓGICA DA IMAGEM ATUALIZADA (COM REDIMENSIONAMENTO) ---
function ImageResizer({ imageRef, editor, onResizeEnd }) {
  const positioningRef = useRef({
    isResizing: false,
    ratio: 0,
    startWidth: 0,
    startX: 0,
  });

  const onMouseMove = (event) => {
    const { isResizing, startWidth, startX, ratio } = positioningRef.current;
    if (isResizing) {
      let newWidth = startWidth + (event.clientX - startX);
      if (newWidth < 100) newWidth = 100;
      const image = imageRef.current;
      if (image) {
        image.style.width = `${newWidth}px`;
        if (ratio !== 0) {
          image.style.height = `${newWidth / ratio}px`;
        }
      }
    }
  };

  const onMouseUp = () => {
    const { isResizing } = positioningRef.current;
    if (isResizing) {
      const image = imageRef.current;
      if (image) {
        const { width, height } = image.style;
        onResizeEnd(width, height);
      }
      positioningRef.current.isResizing = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  };

  const handleMouseDown = (event) => {
    const image = imageRef.current;
    if (image) {
      event.preventDefault();
      const { width, height } = image.getBoundingClientRect();
      positioningRef.current = {
        isResizing: true,
        ratio: width / height,
        startWidth: width,
        startX: event.clientX,
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  };

  return (
    <div className="image-resizer">
      <div
        className="image-handle"
        onMouseDown={handleMouseDown}
        style={{ cursor: "nwse-resize", left: "-8px", top: "-8px" }}
      />
      <div
        className="image-handle"
        onMouseDown={handleMouseDown}
        style={{ cursor: "nesw-resize", right: "-8px", top: "-8px" }}
      />
      <div
        className="image-handle"
        onMouseDown={handleMouseDown}
        style={{ cursor: "nesw-resize", left: "-8px", bottom: "-8px" }}
      />
      <div
        className="image-handle"
        onMouseDown={handleMouseDown}
        style={{ cursor: "nwse-resize", right: "-8px", bottom: "-8px" }}
      />
    </div>
  );
}

function ImageComponent({ src, altText, nodeKey, format, width, height }) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const imageRef = useRef(null);

  const onSelect = useCallback(
    (event) => {
      event.stopPropagation();
      clearSelection();
      setSelected(true);
    },
    [clearSelection, setSelected]
  );

  const onResizeEnd = (newWidth, newHeight) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(newWidth, newHeight);
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (imageRef.current && !imageRef.current.contains(event.target)) {
        clearSelection();
      }
    };
    if (isSelected) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isSelected, clearSelection]);

  return (
    <div className={`image-container ${format || "center"}`} onClick={onSelect}>
      <div className="image-wrapper">
        <img
          ref={imageRef}
          src={src}
          alt={altText}
          style={{
            width: width,
            height: height,
            border: isSelected ? "2px solid #007bff" : "none",
            borderRadius: "2px",
            cursor: "pointer",
            maxWidth: "100%",
          }}
        />
        {isSelected && (
          <ImageResizer
            imageRef={imageRef}
            editor={editor}
            onResizeEnd={onResizeEnd}
          />
        )}
      </div>
    </div>
  );
}

class ImageNode extends DecoratorNode {
  __src;
  __altText;
  __width;
  __height;
  __format;

  static getType() {
    return "image";
  }
  static clone(node) {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__format,
      node.__width,
      node.__height,
      node.__key
    );
  }

  constructor(src, altText, format, width, height, key) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__format = format || "center";
    this.__width = width || "500px";
    this.__height = height || "auto";
  }

  exportJSON() {
    return {
      src: this.getSrc(),
      altText: this.getAltText(),
      format: this.getFormat(),
      type: "image",
      version: 1,
      width: this.getWidth(),
      height: this.getHeight(),
    };
  }
  static importJSON(serializedNode) {
    return $createImageNode(
      serializedNode.src,
      serializedNode.altText,
      serializedNode.format,
      serializedNode.width,
      serializedNode.height
    );
  }

  getSrc() {
    return this.__src;
  }
  getAltText() {
    return this.__altText;
  }
  getFormat() {
    return this.__format;
  }
  getWidth() {
    return this.__width;
  }
  getHeight() {
    return this.__height;
  }

  setWidthAndHeight(width, height) {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setFormat(format) {
    const writable = this.getWritable();
    writable.__format = format;
  }

  createDOM() {
    return document.createElement("div");
  }
  updateDOM() {
    return false;
  }
  decorate(editor, config) {
    return (
      <ImageComponent
        src={this.getSrc()}
        altText={this.getAltText()}
        nodeKey={this.getKey()}
        format={this.getFormat()}
        width={this.getWidth()}
        height={this.getHeight()}
      />
    );
  }
}
function $createImageNode(src, altText, format, width, height) {
  return new ImageNode(src, altText, format, width, height);
}
function $isImageNode(node) {
  return node instanceof ImageNode;
}

const INSERT_IMAGE_COMMAND = createCommand();

function ImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        FORMAT_ELEMENT_COMMAND,
        (format) => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isNodeSelection(selection)) {
              selection.getNodes().forEach((node) => {
                if ($isImageNode(node)) {
                  node.setFormat(format);
                }
              });
            }
          });
          return true;
        },
        0
      ),
      editor.registerCommand(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload.src, payload.altText);
          $insertNodes([imageNode]);

          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const paragraphNode = $createParagraphNode();
            imageNode.insertAfter(paragraphNode);
            paragraphNode.select();
          }
          return true;
        },
        0
      )
    );
  }, [editor]);

  return null;
}

// --- PLUGIN PARA INVERTER O ENTER ---
function EnterKeyOverridePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        if (event.key === "Enter") {
          if (event.shiftKey) {
            event.preventDefault();
            editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
            return true;
          }
          event.preventDefault();
          editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, undefined);
          return true;
        }
        return false;
      },
      1
    );
  }, [editor]);
  return null;
}

// --- BARRA DE FERRAMENTAS ---
function BlockOptionsDropdown({ editor, blockType }) {
  const formatHeading = (level) =>
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection))
        $wrapNodes(selection, () => $createHeadingNode(level));
    });
  const formatQuote = () =>
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection))
        $wrapNodes(selection, () => $createQuoteNode());
    });
  const handleSelect = (e) => {
    const selection = e.target.value;
    if (selection === "paragraph") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection))
          $wrapNodes(selection, () => $createParagraphNode());
      });
    } else if (selection.startsWith("h")) {
      formatHeading(selection);
    } else if (selection === "quote") {
      formatQuote();
    }
  };
  return (
    <select
      className="toolbar-item block-controls"
      value={blockType}
      onChange={handleSelect}
    >
      <option value="paragraph">Parágrafo</option>
      <option value="h1">Cabeçalho 1</option>
      <option value="h2">Cabeçalho 2</option>
      <option value="h3">Cabeçalho 3</option>
      <option value="quote">Citação</option>
    </select>
  );
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [fontSize, setFontSize] = useState("16px");
  const [fontColor, setFontColor] = useState("#000000");

  const handlePrint = () => {
    window.print();
  };

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setFontSize(
        $getSelectionStyleValueForProperty(selection, "font-size", "16px")
      );
      setFontColor(
        $getSelectionStyleValueForProperty(selection, "color", "#000")
      );
      const node = selection.getNodes()[0];
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType(anchorNode, ListNode);
        setBlockType(parentList ? parentList.getTag() : element.getTag());
      } else {
        setBlockType(
          $isHeadingNode(element) ? element.getTag() : element.getType()
        );
      }
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1
      )
    );
  }, [editor, updateToolbar]);

  const onFontSizeSelect = useCallback(
    (e) => {
      const newSize = e.target.value;
      editor.update(() => {
        $patchStyleText($getSelection(), { "font-size": newSize });
      });
    },
    [editor]
  );
  const onFontColorChange = useCallback(
    (e) => {
      const newColor = e.target.value;
      editor.update(() => {
        $patchStyleText($getSelection(), { color: newColor });
      });
    },
    [editor]
  );
  const insertLink = useCallback(() => {
    if (!isLink) {
      const url = prompt("Digite a URL:");
      if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    } else editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  }, [editor, isLink]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: reader.result,
          altText: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatBulletList = () => {
    blockType !== "ul"
      ? editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)
      : editor.dispatchCommand(REMOVE_LIST_COMMAND);
  };
  const formatNumberedList = () => {
    blockType !== "ol"
      ? editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)
      : editor.dispatchCommand(REMOVE_LIST_COMMAND);
  };

  return (
    <div className="toolbar">
      <button onClick={() => editor.dispatchCommand(UNDO_COMMAND)}>
        {Icons.undo}
      </button>
      <button onClick={() => editor.dispatchCommand(REDO_COMMAND)}>
        {Icons.redo}
      </button>
      <button onClick={handlePrint}>{Icons.print}</button>
      <div className="divider" />
      <BlockOptionsDropdown editor={editor} blockType={blockType} />
      <div className="divider" />
      <select value={fontSize} onChange={onFontSizeSelect}>
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
        <option value="24px">24px</option>
      </select>
      <input type="color" value={fontColor} onChange={onFontColorChange} />
      <div className="divider" />
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        className={isBold ? "active" : ""}
      >
        {Icons.bold}
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        className={isItalic ? "active" : ""}
      >
        {Icons.italic}
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        className={isUnderline ? "active" : ""}
      >
        {Icons.underline}
      </button>
      <button
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        className={isStrikethrough ? "active" : ""}
      >
        {Icons.strikethrough}
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
        className={isCode ? "active" : ""}
      >
        {Icons.code}
      </button>
      <div className="divider" />
      <button onClick={insertLink} className={isLink ? "active" : ""}>
        {Icons.link}
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
      <button onClick={() => fileInputRef.current.click()}>
        {Icons.image}
      </button>
      <div className="divider" />
      <button
        onClick={formatBulletList}
        className={blockType === "ul" ? "active" : ""}
      >
        {Icons.ul}
      </button>
      <button
        onClick={formatNumberedList}
        className={blockType === "ol" ? "active" : ""}
      >
        {Icons.ol}
      </button>
      <div className="divider" />
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
      >
        {Icons.alignLeft}
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
      >
        {Icons.alignCenter}
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
      >
        {Icons.alignRight}
      </button>
    </div>
  );
}

// --- CONFIGURAÇÃO ESTÁVEL ---
const editorTheme = {
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
  },
  quote: "editor-quote",
  list: {
    ul: "editor-list-ul",
    ol: "editor-list-ol",
    listitem: "editor-listitem",
  },
  link: "editor-link",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    code: "editor-code",
  },
  paragraph: "editor-paragraph",
};
const editorNodes = [
  ImageNode,
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
];
function onError(error) {
  console.error(error);
}

const initialConfig = {
  namespace: "FinalStableEditor",
  theme: editorTheme,
  onError,
  nodes: editorNodes,
};

// --- COMPONENTE PRINCIPAL ---
function FinalLexicalEditor() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={
              <div className="editor-placeholder">Comece a escrever...</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <EnterKeyOverridePlugin />
          <ImagePlugin />
          <HistoryPlugin />
          <OnChangePlugin onChange={() => {}} />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </div>
    </LexicalComposer>
  );
}

export default FinalLexicalEditor;
