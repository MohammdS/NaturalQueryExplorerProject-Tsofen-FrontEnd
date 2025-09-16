import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowUp, FiPlay } from "react-icons/fi";
import "./QueryPage.css";

export default function QueryPage() {
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

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
    try {
      // Mock SQL generation for now
      const mockSQL = `SELECT * FROM users WHERE name LIKE '%${naturalLanguageQuery}%';`;
      setGeneratedSQL(mockSQL);
    } catch (error) {
      console.error("Error generating SQL:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuery = async () => {
    if (!generatedSQL.trim()) return;

    setLoading(true);
    try {
      // Mock results for now
      const mockResults = [
        { id: 1, name: "Alice Johnson", email: "alice@example.com", age: 28 },
        { id: 2, name: "Bob Smith", email: "bob@example.com", age: 32 },
        { id: 3, name: "Charlie Brown", email: "charlie@example.com", age: 25 }
      ];
      setResults(mockResults);
    } catch (error) {
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
