"use client";

import React, { useState, useRef } from "react";
import * as mammoth from "mammoth";

// Lexical imports (you'll need to install these)
import { $getRoot, $getSelection } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode, $createHeadingNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import {
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode as LexicalListNode,
} from "@lexical/list";
import { $createLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent } from "@lexical/utils";

// Toolbar Component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [fontSize, setFontSize] = useState("14px");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [blockType, setBlockType] = useState("paragraph");

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $findMatchingParent(anchorNode, (parent) =>
            $isListNode(parent)
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type);
          }
        }
      }
    }
  }, [activeEditor]);

  React.useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      1
    );
  }, [editor, updateToolbar]);

  const blockTypeToBlockName = {
    paragraph: "Paragraph",
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    h4: "Heading 4",
    h5: "Heading 5",
    h6: "Heading 6",
    bullet: "Bulleted List",
    number: "Numbered List",
    quote: "Quote",
  };

  const formatText = (format) => {
    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatAlignment = (alignment) => {
    activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  };

  const formatList = (listType) => {
    if (blockType !== listType) {
      activeEditor.dispatchCommand(
        listType === "number"
          ? INSERT_ORDERED_LIST_COMMAND
          : INSERT_UNORDERED_LIST_COMMAND,
        undefined
      );
    } else {
      activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatHeading = (headingSize) => {
    if (blockType !== headingSize) {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const insertLink = () => {
    if (!isBold) {
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-300 bg-gray-50">
      {/* Text Formatting */}
      <button
        onClick={() => formatText("bold")}
        className={`px-2 py-1 rounded text-sm font-bold ${
          isBold ? "bg-blue-200" : "hover:bg-gray-200"
        }`}
        title="Bold"
      >
        B
      </button>
      <button
        onClick={() => formatText("italic")}
        className={`px-2 py-1 rounded text-sm italic ${
          isItalic ? "bg-blue-200" : "hover:bg-gray-200"
        }`}
        title="Italic"
      >
        I
      </button>
      <button
        onClick={() => formatText("underline")}
        className={`px-2 py-1 rounded text-sm underline ${
          isUnderline ? "bg-blue-200" : "hover:bg-gray-200"
        }`}
        title="Underline"
      >
        U
      </button>
      <button
        onClick={() => formatText("strikethrough")}
        className={`px-2 py-1 rounded text-sm ${
          isStrikethrough ? "bg-blue-200 line-through" : "hover:bg-gray-200"
        }`}
        title="Strikethrough"
      >
        abc
      </button>
      <button
        onClick={() => formatText("subscript")}
        className={`px-2 py-1 rounded text-sm ${
          isSubscript ? "bg-blue-200" : "hover:bg-gray-200"
        }`}
        title="Subscript"
      >
        X₂
      </button>
      <button
        onClick={() => formatText("superscript")}
        className={`px-2 py-1 rounded text-sm ${
          isSuperscript ? "bg-blue-200" : "hover:bg-gray-200"
        }`}
        title="Superscript"
      >
        X²
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Alignment */}
      <button
        onClick={() => formatAlignment("left")}
        className="px-2 py-1 rounded text-sm hover:bg-gray-200"
        title="Align Left"
      >
        ⫤
      </button>
      <button
        onClick={() => formatAlignment("center")}
        className="px-2 py-1 rounded text-sm hover:bg-gray-200"
        title="Align Center"
      >
        ⫥
      </button>
      <button
        onClick={() => formatAlignment("right")}
        className="px-2 py-1 rounded text-sm hover:bg-gray-200"
        title="Align Right"
      >
        ⫦
      </button>
      <button
        onClick={() => formatAlignment("justify")}
        className="px-2 py-1 rounded text-sm hover:bg-gray-200"
        title="Justify"
      >
        ⫧
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Lists */}
      <button
        onClick={() => formatList("bullet")}
        className={`px-2 py-1 rounded text-sm ${
          blockType === "bullet" ? "bg-blue-200" : "hover:bg-gray-200"
        }`}
        title="Bullet List"
      >
        •
      </button>
      <button
        onClick={() => formatList("number")}
        className={`px-2 py-1 rounded text-sm ${
          blockType === "number" ? "bg-blue-200" : "hover:bg-gray-200"
        }`}
        title="Numbered List"
      >
        1.
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Dropdowns */}
      <select
        className="px-2 py-1 border border-gray-300 rounded text-sm"
        value={fontSize}
        onChange={(e) => setFontSize(e.target.value)}
        title="Font Size"
      >
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
        <option value="24px">24</option>
      </select>

      <select
        className="px-2 py-1 border border-gray-300 rounded text-sm min-w-20"
        value={fontFamily}
        onChange={(e) => setFontFamily(e.target.value)}
        title="Font Family"
      >
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times</option>
        <option value="Helvetica">Helvetica</option>
        <option value="Georgia">Georgia</option>
        <option value="Verdana">Verdana</option>
      </select>

      <select
        className="px-2 py-1 border border-gray-300 rounded text-sm min-w-24"
        value={blockType}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "paragraph") {
            activeEditor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
              }
            });
          } else if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(value)) {
            formatHeading(value);
          }
        }}
        title="Block Type"
      >
        {Object.entries(blockTypeToBlockName).map(([key, name]) => (
          <option key={key} value={key}>
            {name}
          </option>
        ))}
      </select>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* History */}
      <button
        onClick={() => activeEditor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="px-2 py-1 rounded text-sm hover:bg-gray-200"
        title="Undo"
      >
        ↶
      </button>
      <button
        onClick={() => activeEditor.dispatchCommand(REDO_COMMAND, undefined)}
        className="px-2 py-1 rounded text-sm hover:bg-gray-200"
        title="Redo"
      >
        ↷
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Link */}
      <button
        onClick={insertLink}
        className="px-2 py-1 rounded text-sm hover:bg-gray-200"
        title="Insert Link"
      >
        🔗
      </button>

      {/* Image */}
      <button
        className="px-2 py-1 rounded text-sm hover:bg-gray-200"
        title="Insert Image"
      >
        🖼️
      </button>

      {/* Table */}
      <button
        className="px-2 py-1 rounded text-sm hover:bg-gray-200"
        title="Insert Table"
      >
        ⊞
      </button>
    </div>
  );
}

// Plugin to handle Word content import
function WordImportPlugin({ wordContent }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    if (wordContent) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();

        // Create a temporary div to parse HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = wordContent;

        // Convert HTML to Lexical nodes (simplified)
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        const paragraphNode = $createParagraphNode();
        paragraphNode.append(textContent);
        root.append(paragraphNode);
      });
    }
  }, [wordContent, editor]);

  return null;
}

export default function LexicalWordEditor() {
  const [activeTab, setActiveTab] = useState("word");
  const [wordContent, setWordContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(doc|docx)$/i)) {
      setError("Please select a valid Word document (.doc or .docx)");
      return;
    }

    setIsLoading(true);
    setError("");
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setWordContent(result.value);
    } catch (err) {
      setError("Error reading Word file: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearContent = () => {
    setWordContent("");
    setFileName("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const initialConfig = {
    namespace: "LexicalEditor",
    theme: {
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
        subscript: "align-sub text-xs",
        superscript: "align-super text-xs",
      },
      paragraph: "mb-2",
      heading: {
        h1: "text-3xl font-bold mb-4",
        h2: "text-2xl font-bold mb-3",
        h3: "text-xl font-bold mb-2",
        h4: "text-lg font-bold mb-2",
        h5: "text-base font-bold mb-1",
        h6: "text-sm font-bold mb-1",
      },
      list: {
        nested: {
          listitem: "list-item",
        },
        ol: "list-decimal list-inside",
        ul: "list-disc list-inside",
        listitem: "list-item",
      },
      link: "text-blue-600 underline hover:text-blue-800",
    },
    nodes: [
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
    ],
    onError(error) {
      console.error(error);
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Switcher */}
      <div className="max-w-6xl mx-auto pt-8 pb-4">
        <div className="relative bg-slate-100 p-1 rounded-xl shadow-sm border border-slate-200 w-fit mx-auto">
          <div className="flex relative">
            <div
              className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-lg shadow-sm transition-transform duration-200 ease-out ${
                activeTab === "excel" ? "translate-x-full" : "translate-x-0"
              }`}
            />

            <button
              onClick={() => setActiveTab("word")}
              className={`relative z-10 px-6 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
                activeTab === "word"
                  ? "text-slate-900"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Import Word File
            </button>

            <button
              onClick={() => setActiveTab("excel")}
              className={`relative z-10 px-6 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
                activeTab === "excel"
                  ? "text-slate-900"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Import Excel File
            </button>
          </div>
        </div>
      </div>

      {/* Word Editor Section */}
      {activeTab === "word" && (
        <div className="max-w-6xl mx-auto px-4">
          {/* File Upload */}
          {!wordContent && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="word-upload"
                  />
                  <label
                    htmlFor="word-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg
                      className="w-12 h-12 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-lg font-medium text-gray-700 mb-2">
                      {fileName || "Click to upload Word document"}
                    </span>
                    <span className="text-sm text-gray-500">
                      Supports .doc and .docx files
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {isLoading && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600">
                      Processing document...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lexical Editor */}
          {(wordContent || !fileName) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {fileName && (
                <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {fileName}
                  </h3>
                  <button
                    onClick={clearContent}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Clear
                  </button>
                </div>
              )}

              <LexicalComposer initialConfig={initialConfig}>
                <ToolbarPlugin />
                <div className="relative">
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable
                        className="min-h-96 p-6 focus:outline-none prose prose-slate max-w-none"
                        style={{
                          fontFamily: "Times New Roman, serif",
                          fontSize: "14px",
                          lineHeight: "1.6",
                        }}
                      />
                    }
                    placeholder={
                      <div className="absolute top-6 left-6 text-gray-400 pointer-events-none">
                        {fileName
                          ? "Your Word document content will appear here..."
                          : "Start typing or upload a Word document..."}
                      </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <HistoryPlugin />
                  <AutoFocusPlugin />
                  <LinkPlugin />
                  <ListPlugin />
                  <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                  <WordImportPlugin wordContent={wordContent} />
                </div>
              </LexicalComposer>
            </div>
          )}
        </div>
      )}

      {/* Excel placeholder */}
      {activeTab === "excel" && (
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Excel Import
            </h3>
            <p className="text-gray-600">Excel functionality coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}
