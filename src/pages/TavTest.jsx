import React, { useState } from "react";
import axios from "axios";
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RotateCcw,
  FileJson,
  ListChecks,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

const cardStyle = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 20,
  marginTop: 20,
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
};

// ---- Fixed-width flex "table" that can't be squeezed to zero by outer/global CSS.
// If the panel is narrower than the table, it scrolls horizontally instead of
// clipping/hiding the Score and Rating columns.
const TABLE_MIN_WIDTH = 520;

const rowStyle = {
  display: "flex",
  flexWrap: "nowrap",
  minWidth: TABLE_MIN_WIDTH,
  padding: "10px 8px",
  borderBottom: "1px solid #eee",
  alignItems: "center",
  gap: 12,
};

const headerRowStyle = {
  ...rowStyle,
  borderBottom: "2px solid #ccc",
  fontWeight: 700,
  color: "#333",
};

const colName = { width: 220, flexShrink: 0 };
const colScore = { width: 90, flexShrink: 0 };
const colRating = { width: 190, flexShrink: 0, flexGrow: 1 };

function ScoreRow({ label, score, max = 10, rating, highlight }) {
  return (
    <div
      style={{
        ...rowStyle,
        background: highlight ? "#f2f2f2" : "transparent",
        fontWeight: highlight ? 700 : 400,
      }}
    >
      <div style={colName}>{label}</div>
      <div style={colScore}>
        <ScoreBadge score={score} max={max} />
      </div>
      <div style={colRating}>{rating}</div>
    </div>
  );
}

function ScoreBadge({ score, max = 10 }) {
  if (score === undefined || score === null)
    return <span style={{ color: "#999" }}>-</span>;
  const pct = score / max;
  const color = pct >= 0.7 ? "#2e7d32" : pct >= 0.4 ? "#e65100" : "#c62828";
  return (
    <span style={{ fontWeight: 700, color }}>
      {score}/{max}
    </span>
  );
}

// Wraps a score table with a scrollable container instead of clipping overflow.
function ScoreTable({ children }) {
  return (
    <div
      style={{ border: "1px solid #eee", borderRadius: 8, overflowX: "auto" }}
    >
      {children}
    </div>
  );
}

// Colored highlight banner used for Executive Summary / Strengths / Weaknesses headings
function SectionHeading({ icon, label, bg, fg }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: bg,
        color: fg,
        padding: "6px 14px",
        borderRadius: 6,
        fontWeight: 700,
        fontSize: 15,
        marginTop: 20,
        marginBottom: 10,
      }}
    >
      {icon}
      {label}
    </div>
  );
}

export default function TavTest() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(
        "https://api.turningpages.io/api/v1/tav/run-analysis",
        {
          book_id: 33,
        },
        {
          headers: {
            "x-access-token":
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTc4MzMyNzk0MiwiZXhwIjoxNzgzOTMyNzQyLCJ0eXBlIjoiYWNjZXNzIiwicm9sZV9pZCI6Nn0.uEEsd5pEKpI6XCL6uHposrkYSSM0q2xr2WOrsBKlSn0",
          },
        },
      );

      // IMPORTANT: log the freshly-fetched data here, NOT the `response`/`report`
      // state variables. React state updates are asynchronous, so logging those
      // state variables right after calling setResponse() would just print the
      // OLD value from before this API call (that's why you were seeing
      // response: null / report: undefined in the console).
      const data = res.data.data || res.data;
      console.log("res:", res);
      console.log("raw API data:", data);
      console.log("report:", data?.report);
      console.log("scores:", data?.report?.scores);

      setResponse(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResponse(null);
    setError(null);
  };

  const report = response?.report;
  const header = response?.header;

  // Flatten all chapters from every chunk in chapter_analysis into one array
  const allChapters =
    response?.chapter_analysis?.flatMap((chunk) => chunk.chapters || []) || [];

  return (
    <div
      style={{
        padding: 40,
        background: "#f4f4f4",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        color: "#222",
      }}
    >
      <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <BookOpen size={28} /> TAV Analysis Demo
      </h1>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          onClick={runAnalysis}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            fontSize: 16,
            cursor: loading ? "default" : "pointer",
            background: "#1a1a2e",
            color: "#fff",
            border: "none",
            borderRadius: 8,
          }}
        >
          {loading ? <Loader2 size={18} /> : null}
          {loading ? "Running Analysis..." : "Run TAV (Live API)"}
        </button>

        <button
          onClick={reset}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            fontSize: 16,
            cursor: "pointer",
            background: "#eee",
            border: "none",
            borderRadius: 8,
          }}
        >
          <RotateCcw size={18} />
          Clear
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            background: "#ffe5e5",
            border: "1px solid #c62828",
            borderRadius: 8,
            color: "#900",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <XCircle size={18} />
          Error: {error}
        </div>
      )}

      {header && (
        <div style={{ ...cardStyle, marginTop: 20 }}>
          <h2
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 0,
            }}
          >
            <BookOpen size={22} /> TAV Analysis Report
          </h2>
          <hr style={{ border: "none", borderTop: "1px solid #ddd" }} />

          <div
            style={{
              display: "flex",
              gap: 40,
              flexWrap: "wrap",
              marginTop: 15,
            }}
          >
            <div>
              <p>
                <b>Book:</b> {header?.book?.title}
              </p>
              <p>
                <b>Author:</b> {header.book.author || "-"}
              </p>
              <p>
                <b>Genre:</b> {header.book.genre}
              </p>
              <p>
                <b>Language:</b> {header.book.language}
              </p>
            </div>
            <div>
              <p>
                <b>Total Words:</b> {header.book.total_words?.toLocaleString()}
              </p>
              <p>
                <b>Total Chapters:</b> {header.book.total_chapters}
              </p>
              <p>
                <b>Analysis Date:</b>{" "}
                {new Date(header.analysis_date).toLocaleString()}
              </p>
              <p>
                <b>TAV Version:</b> {header.tav_version}
              </p>
              <p>
                <b>AI Model:</b> {header.model}
              </p>
            </div>
          </div>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid #ddd",
              margin: "20px 0",
            }}
          />

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div
              style={{
                flex: "1 1 200px",
                background: "#f5f5f5",
                padding: 16,
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {header.certification === "Not Yet Certified" ? (
                  <AlertTriangle size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Certification
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color:
                    header.certification === "Not Yet Certified"
                      ? "#c62828"
                      : "#2e7d32",
                }}
              >
                {header.certification}
              </div>
            </div>

            <div
              style={{
                flex: "1 1 200px",
                background: "#f5f5f5",
                padding: 16,
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <TrendingUp size={16} />
                Overall Score
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {report?.overall_score}/30
              </div>
            </div>

            <div
              style={{
                flex: "1 1 200px",
                background: "#f5f5f5",
                padding: 16,
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <ListChecks size={16} />
                Readiness
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color:
                    header.readiness === "Ready for Publication"
                      ? "#2e7d32"
                      : "#e65100",
                }}
              >
                {header.readiness}
              </div>
            </div>
          </div>
        </div>
      )}

      {report && (
        <>
          {/* ---- Overall Scores ---- */}
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Overall Scores</h2>
            <ScoreTable>
              <div style={headerRowStyle}>
                <div style={colName}>Category</div>
                <div style={colScore}>Score</div>
                <div style={colRating}>Rating</div>
              </div>
              <ScoreRow
                label="Theme"
                score={report.scores.theme.score}
                rating={report.scores.theme.rating}
              />
              <ScoreRow
                label="Authority"
                score={report.scores.authority.score}
                rating={report.scores.authority.rating}
              />
              <ScoreRow
                label="Value"
                score={report.scores.value.score}
                rating={report.scores.value.rating}
              />
              <ScoreRow
                label="Overall"
                score={report.overall_score}
                max={30}
                rating={report.readiness}
                highlight
              />
            </ScoreTable>
          </div>

          {/* ---- Section-by-section Scores ---- */}
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>All Audit Section Scores</h2>
            <ScoreTable>
              <div style={headerRowStyle}>
                <div style={colName}>Section</div>
                <div style={colScore}>Score</div>
                <div style={colRating}>Rating</div>
              </div>
              {report.sections?.map((s) => (
                <ScoreRow
                  key={s.key}
                  label={s.name}
                  score={s.score}
                  rating={s.rating}
                />
              ))}
            </ScoreTable>
          </div>

          {/* ---- Executive Summary ---- */}
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Executive Summary</h2>

            <SectionHeading
              icon={<ListChecks size={16} />}
              label="Overall Assessment"
              bg="#e8eaf6"
              fg="#283593"
            />
            <p>{report.executive_summary.overall_assessment}</p>

            <SectionHeading
              icon={<ThumbsUp size={16} />}
              label="Major Strengths"
              bg="#e8f5e9"
              fg="#2e7d32"
            />
            <ul>
              {report.executive_summary.major_strengths?.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>

            <SectionHeading
              icon={<ThumbsDown size={16} />}
              label="Major Weaknesses"
              bg="#fdecea"
              fg="#c62828"
            />
            <ul>
              {report.executive_summary.major_weaknesses?.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>

            {report.executive_summary.editor_notes && (
              <>
                <SectionHeading
                  icon={<AlertTriangle size={16} />}
                  label="Editor Notes"
                  bg="#fff8e1"
                  fg="#8a6d00"
                />
                <p>{report.executive_summary.editor_notes}</p>
              </>
            )}
          </div>

          {/* ---- Priority Revisions ---- */}
          {report?.priority_revisions?.length > 0 && (
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Priority Revisions</h2>

              {report.priority_revisions.map((item, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 16,
                    background: "#fffaf0",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>
                    {index + 1}. {item.chapter}
                  </h3>

                  <SectionHeading
                    icon={<AlertTriangle size={16} />}
                    label="Issue"
                    bg="#fdecea"
                    fg="#c62828"
                  />

                  <p>{item.issue}</p>

                  <SectionHeading
                    icon={<CheckCircle2 size={16} />}
                    label="Recommended Action"
                    bg="#e8f5e9"
                    fg="#2e7d32"
                  />

                  <p>{item.action}</p>

                  <p>
                    <b>Impact:</b> {item.impact}
                  </p>

                  <p>
                    <b>Estimated Effort:</b> {item.estimated_effort}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ---- Full Audit Section Details ---- */}
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Audit Sections (Full Detail)</h2>
            {report.sections?.map((section) => (
              <div
                key={section.key}
                style={{
                  border: "1px solid #ddd",
                  padding: 15,
                  marginBottom: 20,
                  borderRadius: 8,
                }}
              >
                <h3 style={{ marginTop: 0 }}>{section.name}</h3>
                <p>
                  <b>Score:</b> <ScoreBadge score={section.score} /> (
                  {section.rating})
                </p>
                <p>{section.assessment}</p>

                <SectionHeading
                  icon={<ListChecks size={16} />}
                  label="Findings"
                  bg="#e3f2fd"
                  fg="#1565c0"
                />
                <ul>
                  {section.findings?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>

                <SectionHeading
                  icon={<CheckCircle2 size={16} />}
                  label="Recommendations"
                  bg="#e8f5e9"
                  fg="#2e7d32"
                />
                <ul>
                  {section.recommendations?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ---- Chapter Analysis (with per-chapter scores) ---- */}
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Chapter Analysis</h2>

            {allChapters.map((chapter) => (
              <div
                key={chapter.chapter_number}
                style={{
                  borderBottom: "1px solid #ddd",
                  marginBottom: 20,
                  paddingBottom: 20,
                }}
              >
                <h3>
                  Chapter {chapter.chapter_number} - {chapter.chapter_title}
                </h3>

                <p>
                  <b>Purpose:</b> {chapter.purpose}
                </p>
                <p>{chapter.summary}</p>

                <ScoreTable>
                  <div style={headerRowStyle}>
                    <div style={colName}>Metric</div>
                    <div style={colScore}>Score</div>
                    <div style={colRating}>Rating</div>
                  </div>
                  <ScoreRow
                    label="Structure"
                    score={chapter.scores.structure.score}
                    rating={chapter.scores.structure.rating}
                  />
                  <ScoreRow
                    label="Clarity"
                    score={chapter.scores.clarity.score}
                    rating={chapter.scores.clarity.rating}
                  />
                  <ScoreRow
                    label="Flow"
                    score={chapter.scores.flow.score}
                    rating={chapter.scores.flow.rating}
                  />
                  <ScoreRow
                    label="Redundancy"
                    score={chapter.scores.redundancy.score}
                    rating={chapter.scores.redundancy.rating}
                  />
                </ScoreTable>

                <SectionHeading
                  icon={<AlertTriangle size={16} />}
                  label="Issues"
                  bg="#fdecea"
                  fg="#c62828"
                />
                <ul>
                  {chapter.issues?.map((i, index) => (
                    <li key={index}>{i}</li>
                  ))}
                </ul>

                <SectionHeading
                  icon={<CheckCircle2 size={16} />}
                  label="Recommendations"
                  bg="#e8f5e9"
                  fg="#2e7d32"
                />
                <ul>
                  {chapter.recommendations?.map((r, index) => (
                    <li key={index}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ---- Final Recommendation ---- */}
          <div
            style={{
              marginTop: 25,
              padding: 20,
              borderRadius: 10,
              background:
                header?.certification === "Not Yet Certified"
                  ? "#fff4e5"
                  : "#e8f5e9",
              border:
                header?.certification === "Not Yet Certified"
                  ? "1px solid orange"
                  : "1px solid green",
              display: "flex",
              gap: 12,
            }}
          >
            {header?.certification === "Not Yet Certified" ? (
              <AlertTriangle size={24} color="#e65100" />
            ) : (
              <CheckCircle2 size={24} color="#2e7d32" />
            )}
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {header?.certification}
              </div>
             <SectionHeading
  icon={<CheckCircle2 size={16} />}
  label="Final Recommendation"
  bg="#e8f5e9"
  fg="#2e7d32"
/>

<p>{report?.final_recommendation}</p>
            </div>
          </div>

          {/* ---- Next Steps ---- */}
          {report.next_steps && (
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Next Steps</h2>
              <ul>
                {report.next_steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ---- Raw JSON (the actual full API response, as-is) ---- */}
          <div style={cardStyle}>
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 0,
              }}
            >
              <FileJson size={20} />
              Raw API Response (JSON)
            </h2>
            <pre
              style={{
                background: "#222",
                color: "#00ff7f",
                padding: 20,
                borderRadius: 8,
                overflow: "auto",
                maxHeight: 500,
                fontSize: 13,
              }}
            >
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
