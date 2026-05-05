import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "./ChapterEditor.scss";
import { Save } from "lucide-react";

export default function ChapterEditor({
  chapter,
  content,
  setContent,
  onSave,
  saving = false,
}) {
  const [editorReady, setEditorReady] = useState(false);

  return (
    <div className="editor-wrapper">
      {!editorReady && (
        <div className="editor-loader">
          <span className="loader-text">Loading editor... 📝</span>
        </div>
      )}

      <Editor
        apiKey="l8z8itk8wu9fzhh5rycablwg5569p08i4rnr84vdohk2wh3m"
        value={content || chapter?.content || ""}
        init={{
          height: 580,
          menubar: true,
          branding: false,
          plugins:
            "advlist autolink lists link image charmap preview anchor table",
          toolbar:
            "undo redo | blocks fontfamily fontsize | " +
            "bold italic underline strikethrough forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | link image table | removeformat",
          font_family_formats:
            "Arial=arial,helvetica,sans-serif;" +
            "Calibri=calibri,arial,helvetica,sans-serif;" +
            "Georgia=georgia,palatino,serif;" +
            "Times New Roman=times new roman,times,serif;" +
            "Verdana=verdana,geneva,sans-serif;" +
            "Courier New=courier new,courier,monospace;",
          content_style:
            "body { font-family: Georgia, serif; font-size: 16px; line-height: 1.65; color: #1f2937; } " +
            "p { margin: 0 0 1.2em; } " +
            "h1, h2, h3 { color: #0f172a; } " +
            "blockquote { border-left: 4px solid #ed1c24; padding-left: 1rem; color: #4b5563; font-style: italic; margin: 1.5em 0; } " +
            "a { color: #174f78; text-decoration: underline; }",
          automatic_uploads: true,
          file_picker_types: "image",
          setup: (editor) => {
            editor.on("init", () => {
              setTimeout(() => setEditorReady(true), 800); // faster fade-out
            });
          },
        }}
        onEditorChange={(newContent) => setContent(newContent)}
      />




      {/* Floating Save button (optional – can be moved to header if preferred) */}
      {/* {onSave && (
        <button
          className="floating-save-btn"
          onClick={onSave}
          disabled={saving}
          aria-label="Save chapter"
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save size={18} /> Save
            </>
          )}
        </button>
      )} */}
    </div>
  );
}
