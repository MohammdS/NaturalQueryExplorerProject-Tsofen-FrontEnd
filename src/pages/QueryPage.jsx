import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowUp, FiPlay } from "react-icons/fi";
import "./QueryPage.css";
import { generateSQLFetch, executeSQLFetch } from "../fetchers/queryFetch";

export default function QueryPage() {
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [writeMessage, setWriteMessage] = useState(null);
  const [writeDetails, setWriteDetails] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // We expect database name from DatabasesPage
  const { selectedDb } = location.state || {};

  // ✅ Prevent navigation from firing on every render
  useEffect(() => {
    if (!selectedDb) {
      navigate("/databases");
    }
  }, [selectedDb, navigate]);

  const handleGenerateSQL = async () => {
    if (!naturalLanguageQuery.trim()) return;

    setLoading(true);
    setError("");
    try {
      // Debug: Log what we're sending
      console.log("Selected DB object:", selectedDb);
      console.log("All DB fields:", Object.keys(selectedDb));
      console.log("originalName:", selectedDb.originalName);
      console.log("storedFilename:", selectedDb.storedFilename);
      console.log("filename:", selectedDb.filename);
      console.log("name:", selectedDb.name);
      console.log("_id:", selectedDb._id);
      console.log("Sending dbFilename:", selectedDb.storedFilename);
      console.log("Sending prompt:", naturalLanguageQuery.trim());

      const response = await generateSQLFetch(
        naturalLanguageQuery.trim(),
        selectedDb.storedFilename, // Use storedFilename as backend expects
        token
      );

      // Set the generated SQL from backend response
      setGeneratedSQL(response.generatedSQL || "");

      // Clear previous results when generating new SQL
      setResults([]);
    } catch (error) {
      setError(error.message || "Failed to generate SQL");
      console.error("Error generating SQL:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuery = async () => {
    if (!generatedSQL.trim()) return;

    setLoading(true);
    setError("");
    try {
      const response = await executeSQLFetch(
        generatedSQL.trim(),
        selectedDb.storedFilename, // Use storedFilename as backend expects
        token
      );

      if (response && Array.isArray(response.rows)) {
        // SELECT result
        setResults(response.rows);
        setWriteMessage(null);
        setWriteDetails(null);
      } else if (response && response.message) {
        // WRITE result (INSERT/UPDATE/DELETE/DDL)
        setResults([]);
        setWriteMessage(response.message);
        setWriteDetails(response.result || null);
      } else {
        // Fallback for any non-standard shape
        setResults([]);
        setWriteMessage("Statement executed successfully.");
        setWriteDetails(null);
      }
    } catch (error) {
      setError(error.message || "Failed to execute SQL");
      console.error("Error running query:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="query-container">
      <div className="query-header">
        <h1>{selectedDb?.originalName}</h1>
        <button className="back-btn" onClick={() => navigate("/databases")}>
          Back to Databases
        </button>
      </div>

      <div className="query-content">
        <div className="input-section">
          <div className="input-group">
            <div className="input-with-icon">
              <textarea
                placeholder="Describe the query you need…"
                value={naturalLanguageQuery}
                onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                rows={1}
              />
              <button
                className="generate-btn"
                onClick={handleGenerateSQL}
                disabled={loading || !naturalLanguageQuery.trim()}
                title="Generate SQL from your question"
              >
                <FiArrowUp size={20} />
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Generated SQL Query (you can edit this)</label>
            <div className="input-with-icon">
              <textarea
                placeholder=""
                value={generatedSQL}
                onChange={(e) => setGeneratedSQL(e.target.value)}
                rows={2}
              />
              <button
                className="run-btn"
                onClick={handleRunQuery}
                disabled={loading || !generatedSQL.trim()}
                title="Execute this SQL query"
              >
                <FiPlay size={20} />
                Run Query
              </button>
            </div>
          </div>
        </div>

        <div className="results-section">
          <h2>Results</h2>

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {writeMessage && (
            <div className="success-msg" role="status">
              {writeMessage}
              {writeDetails?.changes != null && (
                <span style={{ marginLeft: 8, color: "#475569" }}>
                  (changes: {writeDetails.changes}
                  {writeDetails.lastInsertRowid
                    ? `, last id: ${writeDetails.lastInsertRowid}`
                    : ""}
                  )
                </span>
              )}
            </div>
          )}

          <div className="results-table">
            {results.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-results">
                <div className="grid-placeholder">
                  <div className="grid-cell"></div>
                  <div className="grid-cell"></div>
                  <div className="grid-cell"></div>
                  <div className="grid-cell"></div>
                  <div className="grid-cell"></div>
                  <div className="grid-cell"></div>
                </div>
                <p>Run a query to see results here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
