import React, { useState } from "react";
import { Save, Eye, Edit } from "lucide-react";
import "./ChapterHeader.scss";

const ChapterHeader = ({
  chapter,
  onSave,
  saving = false,
  previewClick,
  editClick,
}) => {
  const [mode, setMode] = useState("edit"); // 'edit' | 'preview'

  const handlePreview = () => {
    setMode("preview");
    previewClick?.("preview");
  };

  const handleEdit = () => {
    setMode("edit");
    editClick?.("edit");
  };

  return (
    <div className="chapter-header">
      <h2 className="chapter-title">{chapter?.title || "Untitled Chapter"}</h2>

      <div className="action-buttons">
        {/* Preview button — shown only in edit mode */}
        {mode === "edit" && (
          <button
            className="btn btn-preview"
            onClick={handlePreview}
            disabled={saving}
            aria-label="Preview chapter"
          >
            <Eye size={18} />
            <span>Preview</span>
          </button>
        )}

        {/* Edit button — shown only in preview mode */}
        {mode === "preview" && (
          <button
            className="btn btn-edit"
            onClick={handleEdit}
            disabled={saving}
            aria-label="Edit chapter"
          >
            <Edit size={18} />
            <span>Edit</span>
          </button>
        )}

        {/* Save button — always visible */}
        <button
          className="btn btn-save"
          onClick={onSave}
          disabled={saving}
          aria-label="Save chapter"
        >
          <Save size={18} />
          <span>{saving ? "Saving..." : "Save"}</span>
        </button>
      </div>
    </div>
  );
};

export default ChapterHeader;
