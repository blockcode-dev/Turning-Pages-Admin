import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { message } from "antd";
import "./AIReportPanel.scss";

export default function AIReportPanel({
  data,
  loading,
  activeTab,
  setActiveTab,
  onRunTool,
  editorContent,
}) {
const [inputText, setInputText] = useState("");
const [hasRunPlagiarism, setHasRunPlagiarism] = useState(false);

  useEffect(() => {
    if (activeTab === "plagiarism") {
      setInputText("");
    }
  }, [activeTab]);

  /* ================= PLAGIARISM ================= */

 const renderPlagiarism = () => {
  const p = data?.plagiarism;

  // 🔹 First time message
  if (!p && !hasRunPlagiarism) {
    return (
     <div className="empty-state">
  <p>
    No plagiarism report yet.  
    Click <strong>Plagiarism Check</strong> above to run the analysis.
  </p>
</div>
    );
  }

  // 🔹 Input UI
  if (!p) {
    return (
      <div className="plagiarism-input">
        <h4>Plagiarism Check</h4>

        <button
          className="use-editor-btn"
          onClick={() => setInputText(editorContent || "")}
        >
          Use Full Chapter Content
        </button>

        <textarea
          placeholder="Or paste selected text..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <button
          className="run-btn"
          onClick={() => {
            if (!inputText.trim()) {
              message.warning("Enter text first");
              return;
            }

            setHasRunPlagiarism(true);
            onRunTool("plagiarism", inputText);
          }}
        >
          Run Check
        </button>
      </div>
    );
  }

  // 🔹 Show report
  return (
    <>
      <div className="score-card">
        <h1>{p.plagiarismScore ?? 0}%</h1>
        <p>Similarity Score</p>
        <span
          className={`badge ${
            p.status === "HIGH_RISK"
              ? "danger"
              : p.status === "MEDIUM_RISK"
              ? "warning"
              : "success"
          }`}
        >
          {p.status?.replace("_", " ") || "UNKNOWN"}
        </span>
      </div>

      <div className="stats-grid">
        <Stat label="Total Words" value={p.stats?.totalWords} />
        <Stat label="Plagiarized" value={p.stats?.plagiarizedWords} />
        <Stat label="Identical" value={p.stats?.identicalWords} />
        <Stat label="Similar" value={p.stats?.similarWords} />
        <Stat label="Sources" value={p.stats?.sourcesMatched} />
      </div>

      <div className="source-list">
        <h4>Detected Sources</h4>

        {p?.others?.sources?.map((src, index) => (
          <div key={index} className="source-item">
            <div className="source-header">
              <span>{src.score}% Match</span>
              <span className="risk">
                {src.score > 80
                  ? "High Risk"
                  : src.score > 50
                  ? "Medium Risk"
                  : "Low Risk"}
              </span>
            </div>

            <div className="source-meta">
              <strong>{src.title || "Untitled"}</strong>
              <p>{src.source}</p>

              {src.url && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Source
                </a>
              )}
            </div>

            {src.plagiarismFound?.length > 0 && (
              <div className="matched-text">
                {src.plagiarismFound[0].sequence}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

  /* ================= CONSISTENCY ================= */

  const renderConsistency = () => {
    const c = data?.consistency;
    if (!c) return <EmptyState text="No consistency report available." />;

    return (
      <>
        <div className="score-card">
          <h1>{c.overall_consistency_score ?? 0}%</h1>
          <p>Consistency Score</p>
        </div>

        {Array.isArray(c.issues) &&
          c.issues.map((issue, i) => (
            <div key={i} className="issue-card">
              <div className="issue-header">
                <AlertTriangle size={16} />
                <span className={`severity ${issue.severity?.toLowerCase()}`}>
                  {issue.severity}
                </span>
              </div>

              <div className="issue-body">
                <p>
                  <strong>Chapter:</strong> {issue.chapter_number} –{" "}
                  {issue.chapter_title}
                </p>

                <p>
                  <strong>Line {issue.line_number}:</strong>{" "}
                  {issue.line_text}
                </p>

                <p className="issue-description">
                  {issue.issue_description}
                </p>

                {issue.suggested_fix && (
                  <div className="suggestion">
                    <strong>Suggested Fix:</strong>
                    <p>{issue.suggested_fix}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
      </>
    );
  };

  /* ================= SUMMARY ================= */

  const renderSummary = () => {
    const s = data?.summary?.summary;
    if (!s) return <EmptyState text="No summary generated yet." />;

    return (
      <>
        {s.short_summary && (
          <div className="summary-box">
            <h4>Short Summary</h4>
            <p>{s.short_summary}</p>
          </div>
        )}

        {s.detailed_summary && (
          <div className="summary-box">
            <h4>Detailed Summary</h4>
            <p>{s.detailed_summary}</p>
          </div>
        )}
      </>
    );
  };

  /* ================= FACT ================= */

  const renderFact = () => {
    console.log(data,"uuuuuu")
    const f = data?.fact;
    if (!f?.length)
      return <EmptyState text="No fact check report available." />;

    return (
      <div className="fact-grid">
        {f.map((item, i) => (
          <div key={i} className="fact-card">
            <strong>{item.claim}</strong>
            <p>{item.explanation}</p>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="ai-report-panel">
        <div className="loader">Running Tav Analysis...</div>
      </div>
    );
  }

  return (
    <div className="ai-report-panel">
      <div className="ai-tabs">
        {["plagiarism", "consistency", "summary", "fact"].map((tab) => (
          <button
            key={tab}
            className={`ai-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="ai-content">
        {activeTab === "plagiarism" && renderPlagiarism()}
        {activeTab === "consistency" && renderConsistency()}
        {activeTab === "summary" && renderSummary()}
        {activeTab === "fact" && renderFact()}
      </div>
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div className="stat-box">
    <h3>{value ?? 0}</h3>
    <p>{label}</p>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="empty-state">
    <p>{text}</p>
  </div>
);
