import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./AddChapterModal.scss";

export default function AddChapterModal({
  visible,
  onCancel,
  onCreate,
  bookId,     
  loading = false,

}) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setTitle("");
      setError("");
    }
  }, [visible]);

const handleSubmit = () => {
  if (!title.trim()) {
    setError("Chapter title is required");
    return;
  }

  onCreate({
    title: title.trim(),
    book_id: bookId,
  });

  setTitle("");
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="add-chapter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Chapter</h2>
          <button
            className="close-btn"
            onClick={onCancel}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <label htmlFor="chapter-title">Chapter Title</label>
          <input
            id="chapter-title"
            type="text"
            placeholder="Enter chapter title..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            className={error ? "input-error" : ""}
          />

          {error && <span className="error-text">{error}</span>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-create"
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
          >
            {loading ? "Creating..." : "Create Chapter"}
          </button>
        </div>
      </div>
    </div>
  );
}
