import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DatabasesPage.css";
import {
  getDbsFetch,
  uploadDbFetch,
  deleteDbFetch,
} from "../fetchers/dbsFetch";

export default function DatabasesPage() {
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Replace this with your auth token (from login)
  const token = localStorage.getItem("token");

  // Load DBs on page load
  useEffect(() => {
    async function loadDbs() {
      try {
        const data = await getDbsFetch(token);
        setDatabases(data);
      } catch (err) {
        setError(err.message);
      }
    }
    loadDbs();
  }, [token]);

  // Upload file
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".db") && !file.name.endsWith(".sqlite")) {
      setError("Only .db or .sqlite files are allowed");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50 MB");
      return;
    }

    try {
      setError("");
      const res = await uploadDbFetch(file, token);
      setDatabases((prev) => [res.db, ...prev]); // add new db to list
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete DB
  const handleDelete = async (id) => {
    try {
      await deleteDbFetch(id, token);
      setDatabases(databases.filter((db) => db._id !== id));
      if (selectedDb === id) setSelectedDb(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="db-container">
      <header className="db-header">
        <h1>Your Databases</h1>
        <button className="history-btn" onClick={() => navigate("/history")}>
          History
        </button>
      </header>

      {error && <div className="error-msg">⚠ {error}</div>}

      <div className="db-list">
        {databases.length === 0 ? (
          <div className="empty-state">
            <p>No databases uploaded yet</p>
            <label className="add-btn">
              + Add Database
              <input
                type="file"
                accept=".db,.sqlite"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>
          </div>
        ) : (
          <>
            {databases.map((db) => (
              <div
                key={db._id}
                className={`db-card ${selectedDb === db._id ? "selected" : ""}`}
              >
                <h2>{db.originalName}</h2>
                <p className="db-meta">
                  Size: {(db.size / 1024).toFixed(1)} KB
                </p>
                <div className="db-actions">
                  <button onClick={() => setSelectedDb(db._id)}>
                    Select DB
                  </button>
                  <button
                    onClick={() => handleDelete(db._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {databases.length < 5 && (
              <label className="add-btn">
                + Add Database
                <input
                  type="file"
                  accept=".db,.sqlite"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </>
        )}
      </div>

      <footer className="db-footer">
        <button
          disabled={!selectedDb}
          className="continue-btn"
          onClick={() =>
            navigate("/query", { state: { selectedDb } })
          }
        >
          Continue to Query Page
        </button>
      </footer>
    </div>
  );
}
