import { useState, useEffect, useRef } from "react";
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
  
  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // We expect database name from DatabasesPage or pre-filled data from HistoryPage
  const { selectedDb, preFilledQuery, preFilledSQL, fromHistory } = location.state || {};

  // ✅ Prevent navigation from firing on every render
  useEffect(() => {
    if (!selectedDb) {
      navigate("/databases");
    }
  }, [selectedDb, navigate]);

  // ✅ Pre-fill queries when coming from history
  useEffect(() => {
    if (preFilledQuery) {
      setNaturalLanguageQuery(preFilledQuery);
    }
    if (preFilledSQL) {
      setGeneratedSQL(preFilledSQL);
    }
  }, [preFilledQuery, preFilledSQL]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        token,
        naturalLanguageQuery.trim() // Pass the original prompt for history
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

  const exportToCSV = () => {
    if (results.length === 0) return;
    
    const headers = Object.keys(results[0]);
    const csvContent = [
      headers.join(','),
      ...results.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that contain commas, quotes, or newlines
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `query_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (results.length === 0) return;
    
    const jsonData = {
      query: {
        naturalLanguage: naturalLanguageQuery,
        sql: generatedSQL,
        database: selectedDb?.originalName
      },
      executedAt: new Date().toISOString(),
      results: results
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `query_results_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="query-container">
      <div className="query-header">
        <div>
          <h1>{selectedDb?.originalName}</h1>
          {fromHistory && (
            <p style={{ 
              margin: "0.5rem 0 0 0", 
              color: "#666", 
              fontSize: "0.9rem",
              fontStyle: "italic" 
            }}>
              Loaded from history - ready to run again
            </p>
          )}
        </div>
        <button className="back-btn" onClick={() => navigate(fromHistory ? "/history" : "/databases")}>
          {fromHistory ? "Back to History" : "Back to Databases"}
        </button>
      </div>

      <div className="query-content">
        <div className="input-section">
          <div className="input-group">
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <textarea
                placeholder="Describe the query you need…"
                value={naturalLanguageQuery}
                onChange={(e) => {
                  setNaturalLanguageQuery(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (naturalLanguageQuery.trim() && !loading) {
                      handleGenerateSQL();
                    }
                  }
                }}
                rows={1}
                style={{
                  resize: 'none',
                  overflow: 'hidden',
                  minHeight: '40px',
                  maxHeight: '120px',
                  paddingRight: naturalLanguageQuery.trim() ? '80px' : '50px',
                  paddingTop: naturalLanguageQuery.trim() ? '8px' : '8px'
                }}
              />
              {naturalLanguageQuery.trim() && (
                <button
                  onClick={() => {
                    setNaturalLanguageQuery('');
                  }}
                  style={{
                    position: 'absolute',
                    right: '60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    color: '#ccc',
                    padding: '2px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    transition: 'all 0.2s ease',
                    zIndex: 10,
                    opacity: 0.6
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = '#999';
                    e.target.style.opacity = '1';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = '#ccc';
                    e.target.style.opacity = '0.6';
                  }}
                  title="Clear prompt"
                >
                  ✕
                </button>
              )}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2>Results</h2>
            {results.length > 0 && (
              <div ref={exportDropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    color: "#213555",
                    border: "1px solid #D8C4B6",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(10px)"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
                    e.target.style.borderColor = "#213555";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                    e.target.style.borderColor = "#D8C4B6";
                  }}
                >
                  Export {showExportDropdown ? "▲" : "▼"}
                </button>
                
                {showExportDropdown && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    right: "0",
                    marginTop: "0.3rem",
                    background: "rgba(255, 255, 255, 0.98)",
                    border: "1px solid #D8C4B6",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    backdropFilter: "blur(10px)",
                    zIndex: 1000,
                    minWidth: "120px"
                  }}>
                    <button
                      onClick={() => {
                        exportToCSV();
                        setShowExportDropdown(false);
                      }}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: "0.6rem 0.8rem",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: "500",
                        color: "#213555",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        borderRadius: "12px 12px 0 0",
                        transition: "background-color 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "rgba(33, 53, 85, 0.1)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      CSV
                    </button>
                    <div style={{
                      height: "1px",
                      background: "rgba(216, 196, 182, 0.3)",
                      margin: "0 0.5rem"
                    }}></div>
                    <button
                      onClick={() => {
                        exportToJSON();
                        setShowExportDropdown(false);
                      }}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: "0.6rem 0.8rem",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: "500",
                        color: "#213555",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        borderRadius: "0 0 12px 12px",
                        transition: "background-color 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "rgba(33, 53, 85, 0.1)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      JSON
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

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
