import React, { useRef, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import "./AIAssistantDrawer.scss";

export default function AIAssistantDrawer({
  visible,
  onClose,
  instruction,
  setInstruction,
  aiLoading,
  onGenerate,
  streamedText,
  setStreamedText,
  onInsertToEditor,
}) {
  const textareaRef = useRef(null);

  // Focus textarea when drawer opens
  useEffect(() => {
    if (visible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [visible]);

  const handleKeyDown = (e) => {
    // Enter triggers generation, Shift+Enter for newline
    if (e.key === "Enter" && !e.shiftKey && !aiLoading && instruction.trim()) {
      e.preventDefault();
      onGenerate();
    }
  };

  if (!visible) return null;

  return (
    <div className="ai-drawer-overlay" onClick={onClose}>
      <div className="ai-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <h2>AI Assistant</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Instruction */}
          <label htmlFor="ai-instruction">Instruction</label>
          <p className="hint">
            Describe what you want the AI to write (e.g., "Write an introduction
            for Chapter 1 about magic.")
          </p>
          <textarea
            ref={textareaRef}
            id="ai-instruction"
            rows={5}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want the AI to write..."
            disabled={aiLoading}
            className="ai-textarea"
          />

          {/* Generate Button */}
          <button
            className="generate-btn"
            onClick={onGenerate}
            disabled={aiLoading || !instruction.trim()}
          >
            {aiLoading ? (
              <>
                <Loader2 size={18} className="spin" />
                Generating...
              </>
            ) : (
              "Generate Content"
            )}
          </button>

          {/* Output / Streamed Text */}
          <div className="ai-output">
            {aiLoading && streamedText === "" ? (
              <div className="loading-state">
                <Loader2 size={24} className="spin" />
                <p>AI is writing your content...</p>
              </div>
            ) : streamedText ? (
              <div className="streamed-text">{streamedText}</div>
            ) : (
              <p className="placeholder">
                The AI’s response will appear here as it generates...
              </p>
            )}
          </div>

          {/* Insert Button */}
          {streamedText && !aiLoading && (
            <button className="insert-btn" onClick={onInsertToEditor}>
              Insert into Editor
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
