import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlay, FiDatabase, FiRefreshCw, FiDownload } from "react-icons/fi";
import "./QueryPage.css";
import { useAuth } from "../context/AuthContext";
import { generateQueryFetch, executeQueryFetch } from "../fetchers/queryFetch";
import { getTablesFetch } from "../fetchers/dbsFetch";

export default function QueryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const { selectedDb } = location.state || {};

  const [prompt, setPrompt] = useState("");
  const [schema, setSchema] = useState(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [generated, setGenerated] = useState(null); // { generatedSQL, safe, safetyError, schemaUsed }
  const [editableSQL, setEditableSQL] = useState("");
  const [generating, setGenerating] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null); // { rows, meta }
  const [error, setError] = useState("");
  const [proceedUnsafe, setProceedUnsafe] = useState(false);

  // Guard route
  useEffect(() => {
    if (!selectedDb) {
      navigate("/databases");
    }
  }, [selectedDb, navigate]);

  // Load schema
  useEffect(() => {
    async function load() {
      if (!selectedDb?.storedFilename) return;
      try {
        setLoadingSchema(true);
        const data = await getTablesFetch(selectedDb.storedFilename, token);
        setSchema(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingSchema(false);
      }
    }
    load();
  }, [selectedDb, token]);

  async function handleGenerate() {
    setError("");
    setGenerated(null);
    setResult(null);
    setProceedUnsafe(false);
    try {
      setGenerating(true);
      const data = await generateQueryFetch(
        {
          prompt: prompt.trim(),
          dbFilename: selectedDb.storedFilename,
        },
        token
      );
      setGenerated(data);
      setEditableSQL(data.generatedSQL || "");
    } catch (e) {
      setError(e.message || "Failed to generate SQL");
    } finally {
      setGenerating(false);
    }
  }

  async function handleExecute() {
    setError("");
    try {
      setExecuting(true);
      const data = await executeQueryFetch(
        {
          sql: editableSQL,
          dbFilename: selectedDb.storedFilename,
        },
        token
      );
      setResult(data);
    } catch (e) {
      setError(e.message || "Failed to execute SQL");
    } finally {
      setExecuting(false);
    }
  }

  function exportCSV() {
    if (!result?.rows?.length) return;
    const cols = result.meta?.columns || Object.keys(result.rows[0]);
    const lines = [cols.join(",")];
    for (const row of result.rows) {
      lines.push(cols.map((c) => JSON.stringify(row[c] ?? "")).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query_result.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const unsafe = generated?.safetyError;
  const canExecute = !!editableSQL && (!unsafe || proceedUnsafe);

  return (
    <div className="query-container">
      <div className="query-inner">
        <header className="query-header">
          <div className="db-label">
            <FiDatabase size={16} /> {selectedDb?.originalName}
          </div>
          <button onClick={() => navigate("/databases")}>Back</button>
        </header>

        {error && (
          <div className="error-msg" style={{ marginBottom: "0.75rem" }}>
            {error}
          </div>
        )}

        <section className="prompt-panel">
          <textarea
            placeholder="Ask in natural language (e.g., Show total sales by region this month)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <div className="actions-row">
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || !selectedDb || generating}
            >
              {generating ? "Generating..." : "Generate SQL"}
            </button>
            <button
              onClick={() => {
                setPrompt("");
                setGenerated(null);
                setEditableSQL("");
                setResult(null);
                setError("");
              }}
              className="secondary-btn"
              disabled={generating || executing}
            >
              Reset
            </button>
          </div>
        </section>

        <div className="layout-split">
          <aside className="schema-panel">
            <div className="panel-header">
              Schema {loadingSchema && <FiRefreshCw className="spin" />}
            </div>
            {schema?.tables?.length ? (
              <ul className="schema-tree">
                {schema.tables.map((t) => (
                  <li key={t.name}>
                    <strong>{t.name}</strong>
                    <ul>
                      {t.columns.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="muted">
                {loadingSchema ? "Loading schema..." : "No schema loaded"}
              </div>
            )}
          </aside>
          <main className="work-panel">
            {generated && (
              <div className="generated-block">
                <div className="generated-meta">
                  <span
                    className={`badge ${generated.safe ? "safe" : "unsafe"}`}
                  >
                    {generated.safe ? "SAFE" : "NEEDS REVIEW"}
                  </span>
                  {unsafe && <span className="warn-text">{unsafe}</span>}
                </div>
                <textarea
                  className="sql-editor"
                  rows={6}
                  value={editableSQL}
                  onChange={(e) => setEditableSQL(e.target.value)}
                />
                {unsafe && (
                  <label className="checkbox-inline">
                    <input
                      type="checkbox"
                      checked={proceedUnsafe}
                      onChange={(e) => setProceedUnsafe(e.target.checked)}
                    />
                    I understand the risk; proceed anyway.
                  </label>
                )}
                <button
                  onClick={handleExecute}
                  disabled={!canExecute || executing}
                  className="execute-btn"
                >
                  {executing ? (
                    "Executing..."
                  ) : (
                    <>
                      <FiPlay /> Execute
                    </>
                  )}
                </button>
              </div>
            )}

            {result && (
              <div className="results-block">
                <div className="results-header">
                  <h3>
                    Results{" "}
                    {result.meta?.truncated && (
                      <span className="muted">(Limited)</span>
                    )}
                  </h3>
                  <div className="result-actions">
                    <button onClick={exportCSV} className="secondary-btn">
                      <FiDownload /> Export CSV
                    </button>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {(
                          result.meta?.columns ||
                          (result.rows[0] ? Object.keys(result.rows[0]) : [])
                        ).map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((r, idx) => (
                        <tr key={idx}>
                          {(result.meta?.columns || Object.keys(r)).map((c) => (
                            <td key={c}>{String(r[c] ?? "")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.meta?.durationMs != null && (
                  <div className="meta-bar">
                    Duration: {result.meta.durationMs} ms
                    {result.meta.appliedLimit
                      ? ` | LIMIT ${result.meta.appliedLimit}`
                      : ""}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
