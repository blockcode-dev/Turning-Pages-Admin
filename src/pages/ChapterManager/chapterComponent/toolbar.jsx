import React, { useState, useEffect } from "react";
import {
  Save,
  Eye,
  Edit,
  Upload,
  PanelRight,
  X,
  PlayCircle,
} from "lucide-react";
import "./Toolbar.scss";

export default function Toolbar({
  chapterTitle,
  saving = false,
  viewMode,
  setViewMode,
  onToggleAIPanel,
  isAIPanelOpen,
  onRunAITool,
  activeTool,
  onSave,
  onOpenUploadModal,
}) {
  const isEditMode = viewMode === "edit";
  const [selectedTool, setSelectedTool] = useState(activeTool || "");

  useEffect(() => {
    setSelectedTool(activeTool || "");
  }, [activeTool]);

  const handleRunTool = () => {
    console.log(selectedTool,"selectedTool")
    if (!selectedTool) {
      alert("Please select an AI Tool");
      return;
    }
    onRunAITool(selectedTool);
  };

  return (
    <div className="chapter-toolbar">
      <div className="chapter-title">
        <h2>{chapterTitle?.title || "Untitled Chapter"}</h2>
      </div>

      <div className="action-buttons">
        <div className="ai-tool-select">
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
          >
            <option value="">Select AI Tool</option>
            <option value="plagiarism">Plagiarism Check</option>
            <option value="consistency">Consistency Check</option>
            <option value="summary">Generate Summary</option>
            <option value="fact">Fact Checking</option>
          </select>

          <button className="toolbar-btn run-ai-btn" onClick={handleRunTool}>
            <PlayCircle size={18} />
          </button>
        </div>

        <button className="toolbar-btn upload-btn" onClick={onOpenUploadModal}>
          <Upload size={18} />
          <span>Upload</span>
        </button>

        <button
          className={`toolbar-btn ${isAIPanelOpen ? "active" : ""}`}
          onClick={onToggleAIPanel}
        >
          {isAIPanelOpen ? <X size={18} /> : <PanelRight size={18} />}
          <span>{isAIPanelOpen ? "Close AI" : "Open AI"}</span>
        </button>

        {isEditMode ? (
          <button className="toolbar-btn" onClick={() => setViewMode("preview")}>
            <Eye size={18} />
            <span>Preview</span>
          </button>
        ) : (
          <button className="toolbar-btn" onClick={() => setViewMode("edit")}>
            <Edit size={18} />
            <span>Edit</span>
          </button>
        )}

        <button className="toolbar-btn save-btn" disabled={saving}   onClick={onSave}>
          <Save size={18} />
          <span>{saving ? "Saving..." : "Save"}</span>
        </button>
      </div>
    </div>
  );
}
