import React from "react";
import { Plus, Trash2 } from "lucide-react";
import "./ChapterList.scss";

export default function ChapterList({
  chapters = [],
  selectedId,
  onSelect,
  onAdd,
  onDelete,
}) {
  const handleDeleteClick = (chapterId, e) => {
    e.stopPropagation(); // Prevent selecting the chapter when clicking delete
    if (window.confirm("Delete this chapter permanently?")) {
      onDelete?.(chapterId);
    }
  };

  return (
    <div className="chapter-list-wrapper">
      <div className="sider-header">
        <h3>Chapters</h3>
        <button
          className="add-chapter-btn"
          onClick={onAdd}
          title="Add new chapter"
          aria-label="Add new chapter"
        >
          <Plus size={18} />
        </button>
      </div>

      {chapters.length === 0 ? (
        <div className="empty-list">
          <p>No chapters yet</p>
          <button className="add-first-btn" onClick={onAdd}>
            <Plus size={16} /> Create your first chapter
          </button>
        </div>
      ) : (
        <ul className="chapter-list">
          {chapters.map((chapter) => (
            <li
              key={chapter.id}
              className={`chapter-item ${
                chapter.id === selectedId ? "active" : ""
              }`}
              onClick={() => onSelect(chapter.id)}
            >
              <div className="chapter-info">
                <span className="chapter-title">
                  {chapter.title || "Untitled Chapter"}
                </span>
                <span className="chapter-meta">
                  {chapter.word_count || 0} words
                </span>
              </div>

              <button
                className="delete-btn"
                onClick={(e) => handleDeleteClick(chapter.id, e)}
                title="Delete chapter"
                aria-label="Delete chapter"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
