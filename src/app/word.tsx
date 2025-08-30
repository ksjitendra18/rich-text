import { ChangeEvent, FormEvent, useRef, useState } from "react";

import { Editor, EditorTools } from "@progress/kendo-react-editor";

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

import * as mammoth from "mammoth";

export const Word = () => {
  const [activeTab, setActiveTab] = useState("word");
  const [wordContent, setWordContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    // Check if it's a Word file
    if (!file.name.match(/\.(doc|docx)$/i)) {
      setError("Please select a valid Word document (.doc or .docx)");
      return;
    }

    setUploadSuccess(false);
    setIsLoading(true);
    setError("");
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });

      setWordContent(result.value);

      // Display any conversion messages/warnings
      if (result.messages.length > 0) {
        console.log("Conversion messages:", result.messages);
      }
    } catch (err: unknown) {
      setError("Error reading Word file: " + err.message);
      console.error("Error:", err);
    } finally {
      setUploadSuccess(true);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {!uploadSuccess && (
          <>
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
          </>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">Processing document...</span>
            </div>
          </div>
        )}
      </div>

      {uploadSuccess && (
        <>
          <Editor
            tools={[
              [Bold, Italic, Underline, Strikethrough],
              [Subscript, Superscript],
              [AlignLeft, AlignCenter, AlignRight, AlignJustify],
              [Indent, Outdent],
              [OrderedList, UnorderedList],
              FontSize,
              FontName,
              FormatBlock,
              [Undo, Redo],
              [Link, Unlink, InsertImage, ViewHtml],
              [InsertTable],
              [AddRowBefore, AddRowAfter, AddColumnBefore, AddColumnAfter],
              [DeleteRow, DeleteColumn, DeleteTable],
              [MergeCells, SplitCell],
            ]}
            contentStyle={{ height: 630 }}
            defaultContent={wordContent}
          />
        </>
      )}
    </div>
  );
};
