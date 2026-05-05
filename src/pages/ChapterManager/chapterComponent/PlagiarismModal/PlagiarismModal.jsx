import React, { useState, useEffect } from "react";
import { Modal, Button, message } from "antd";

export default function PlagiarismModal({
  open,
  onClose,
  chapterText,
  onCheckPlagiarism,
}) {
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedText("");
    }
  }, [open]);

  const handleMouseUp = () => {
    const text = window.getSelection().toString().trim();
    if (text) {
      setSelectedText(text);
    }
  };

  // ✅ Count only alphabet characters (A–Z, a–z)
  const countAlphabetCharacters = (text) => {
    const matches = text.match(/[A-Za-z]/g);
    return matches ? matches.length : 0;
  };

  const handleCheck = () => {
    if (!selectedText) {
      message.warning("Please select text first");
      return;
    }

    const alphabetCount = countAlphabetCharacters(selectedText);

    if (alphabetCount < 200) {
      message.error(
        `Minimum 200 alphabet characters required. Currently provided: ${alphabetCount}`
      );
      return;
    }

    onCheckPlagiarism(selectedText);
  };

  return (
    <Modal
      title="Plagiarism Check"
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
    >
      <div
        style={{
          border: "1px solid #ddd",
          padding: "15px",
          minHeight: "300px",
          maxHeight: "400px",
          overflowY: "auto",
          marginBottom: "20px",
          cursor: "text",
        }}
        onMouseUp={handleMouseUp}
      >
        <div dangerouslySetInnerHTML={{ __html: chapterText }} />
      </div>

      {selectedText && (
        <div style={{ marginBottom: "15px" }}>
          <strong>Selected Text:</strong>
          <div
            style={{
              background: "#f5f5f5",
              padding: "10px",
              marginTop: "5px",
              maxHeight: "120px",
              overflowY: "auto",
            }}
          >
            {selectedText}
          </div>

          <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
            Alphabet Characters Count:{" "}
            {countAlphabetCharacters(selectedText)}
          </div>
        </div>
      )}

      <Button type="primary" onClick={handleCheck}>
        Check Plagiarism
      </Button>
    </Modal>
  );
}
