import React, { useState, useRef } from "react";
import { Loader2 } from "lucide-react"; // optional spinner icon
import "./GrammarAssistant.scss";

export default function GrammarAssistant({ text, setText, token }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  const checkGrammar = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setErrors([]);

    try {
      const res = await fetch(
        "https://api.turningpages.io:9090/api/v1/grammar/check",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!res.ok) throw new Error("Grammar check failed");

      const data = await res.json();
      setErrors(data?.errors || []);
    } catch (err) {
      console.error("Grammar check error:", err);
      alert("Failed to check grammar");
    } finally {
      setLoading(false);
    }
  };

  const highlightText = () => {
    if (!text || errors.length === 0) return { __html: text };

    let highlighted = text;

    errors.forEach((err) => {
      const wrong = err.wrong;
      const suggestion = err.suggestion || wrong;

      const regex = new RegExp(
        wrong.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );

      highlighted = highlighted.replace(
        regex,
        `<span class="grammar-error" data-wrong="${wrong}" data-suggestion="${suggestion}" title="Click to apply suggestion">${wrong}</span>`
      );
    });

    return { __html: highlighted };
  };

  const handleErrorClick = (e) => {
    if (e.target.classList.contains("grammar-error")) {
      const wrong = e.target.getAttribute("data-wrong");
      const suggestion = e.target.getAttribute("data-suggestion");

      if (suggestion && suggestion !== wrong) {
        setText((prev) => prev.replace(wrong, suggestion));
      }
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selected = selection.toString().trim();
    if (selected) {
      setSelectedText(selected);
      // Optional: console.log("Selected text:", selected);
      // You can later send this to AI rewrite endpoint
    } else {
      setSelectedText("");
    }
  };

  return (
    <div className="grammar-container">
      {/* Header / Actions */}
      <div className="grammar-header">
        <button
          className="grammar-check-btn"
          onClick={checkGrammar}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin" />
              Checking...
            </>
          ) : (
            "Check Grammar"
          )}
        </button>

        {selectedText && (
          <div className="selected-info">
            Selected: <em>"{selectedText}"</em>
          </div>
        )}
      </div>

      <div className="grammar-body">
        {/* Left: Preview with highlights */}
        <div
          className="grammar-preview"
          onClick={handleErrorClick}
          onMouseUp={handleTextSelection}
          dangerouslySetInnerHTML={highlightText()}
        />

        {/* Right: Suggestions sidebar */}
        <div className="grammar-sidebar">
          <h3>Suggestions {errors.length > 0 && `(${errors.length})`}</h3>

          {loading ? (
            <div className="loading-suggestions">
              <Loader2 size={20} className="spin" /> Analyzing...
            </div>
          ) : errors.length === 0 ? (
            <div className="no-errors">
              <p>Everything looks good! 🎉</p>
            </div>
          ) : (
            <div className="suggestions-list">
              {errors.map((err, i) => (
                <div key={i} className="grammar-item">
                  <div className="issue">
                    <strong>Issue:</strong> {err.message}
                  </div>
                  {err.suggestion && err.suggestion !== err.wrong && (
                    <div className="suggestion">
                      <strong>Fix:</strong> {err.suggestion}
                      <button
                        className="apply-btn"
                        onClick={() =>
                          setText((prev) =>
                            prev.replace(err.wrong, err.suggestion)
                          )
                        }
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
