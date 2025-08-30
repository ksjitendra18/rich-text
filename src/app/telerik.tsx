"use client";

import { useState } from "react";

import { Editor, EditorTools } from "@progress/kendo-react-editor";
import { Word } from "./word";

const {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  OrderedList,
  UnorderedList,
  Undo,
  Redo,
  FontSize,
  FontName,
  FormatBlock,
  Link,
  Unlink,
  InsertImage,
  ViewHtml,
  InsertTable,
  AddRowBefore,
  AddRowAfter,
  AddColumnBefore,
  AddColumnAfter,
  DeleteRow,
  DeleteColumn,
  DeleteTable,
  MergeCells,
  SplitCell,
} = EditorTools;

export const Telerik = () => {
  const [activeTab, setActiveTab] = useState("word");
  return (
    <>
      <div className="flex items-center justify-center my-10">
        <div className="relative bg-slate-100 p-1 rounded-xl shadow-sm border border-slate-200">
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
              Create New Note
            </button>
          </div>
        </div>
      </div>

      {activeTab === "word" && (
        <>
          <Word />
        </>
      )}
    </>
  );
};
