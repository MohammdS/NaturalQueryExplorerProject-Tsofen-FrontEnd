import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiDatabase, FiTrash2, FiPlus, FiLogOut, FiDownload } from "react-icons/fi";
import "./DatabasesPage.css";
import {
  getDbsFetch,
  uploadDbFetch,
  deleteDbFetch,
  createDbFetch,
  downloadDbFetch,
} from "../fetchers/dbsFetch";

export default function DatabasesPage() {
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(""); // "upload" or "create"
  const [createDbName, setCreateDbName] = useState("");
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("user") || "Guest"; // استبدل هذا بحسب API

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

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event) {
      const menuEl = menuRef.current;
      const buttonEl = menuButtonRef.current;
      if (!menuEl || !buttonEl) return;
      const clickedInsideMenu = menuEl.contains(event.target);
      const clickedMenuButton = buttonEl.contains(event.target);
      if (!clickedInsideMenu && !clickedMenuButton) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

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
      setDatabases((prev) => [res.db, ...prev]);
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Create database
  const handleCreateDatabase = async () => {
    if (!createDbName.trim()) {
      setError("Database name is required");
      return;
    }

    try {
      setError("");
      const res = await createDbFetch(createDbName.trim(), token);
      setDatabases((prev) => [res.db, ...prev]);
      setCreateDbName("");
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete DB
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this database?")) return;
    try {
      await deleteDbFetch(id, token);
      setDatabases(databases.filter((db) => db._id !== id));
      if (selectedDb === id) setSelectedDb(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {
      // ignore storage errors
    }
    setMenuOpen(false);
    navigate("/auth");
  };

  // Download DB
  const handleDownload = async (e, db) => {
    e.stopPropagation();
    try {
      setError("");
      const blob = await downloadDbFetch(db._id, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = db.originalName || `${db._id}.db`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="db-container">
      {/* NavBar */}
      <nav className="db-navbar">
        <h2 className="project-title">DB Manager</h2>
        <div className="nav-right">
          <span className="user-info">{userName}</span>
          <button
            className="menu-btn"
            ref={menuButtonRef}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <FiMenu size={24} />
          </button>
          {menuOpen && (
            <div className="dropdown-menu" ref={menuRef}>
              <button onClick={() => navigate("/history")}>History</button>
              <button onClick={handleLogout}>
                <FiLogOut style={{ marginRight: "6px" }} />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {error && <div className="error-msg">⚠ {error}</div>}

      {/* Database Cards */}
      <div className="db-list">
        {databases.map((db) => (
          <div
            key={db._id}
            className={`db-card ${selectedDb === db._id ? "selected" : ""}`}
            onClick={(e) => {
              // Only navigate if no text is selected and it's a simple click
              if (window.getSelection().toString() === '' && e.detail === 1) {
                navigate("/query", { state: { selectedDb: db } });
              }
            }}
          >
            <h3>
              <FiDatabase style={{ marginRight: "8px" }} />
              {db.originalName}
            </h3>
            {db.description && <p>{db.description}</p>}
            <p className="db-meta">Size: {(db.size / 1024).toFixed(1)} KB</p>
            <div className="db-actions">
              <button onClick={(e) => handleDownload(e, db)}>
                <FiDownload style={{ marginRight: "6px" }} />
                Save
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(db._id); }}
                className="delete-btn"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        ))}

        {/* Counter above Add Card */}
        {databases.length < 5 && (
          <div className="db-count-inline" aria-label={`databases count`}>
            {databases.length}/5 databases used
          </div>
        )}

        {/* Add Card */}
        {databases.length < 5 && (
          <div className="db-card add-card" onClick={() => setModalOpen(true)}>
            <div className="add-card-content">
              <FiPlus size={32} />
              <p>Add Database</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer removed: navigate by clicking on a card */}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Database</h3>
            
            {!modalMode ? (
              <div className="modal-options">
                <button 
                  className="modal-option-btn"
                  onClick={() => setModalMode("upload")}
                >
                  <FiDatabase size={24} />
                  Upload Database File
                </button>
                <button 
                  className="modal-option-btn"
                  onClick={() => setModalMode("create")}
                >
                  <FiPlus size={24} />
                  Create New Database
                </button>
              </div>
            ) : modalMode === "upload" ? (
              <div className="modal-upload">
                <label className="file-upload-btn">
                  <input
                    type="file"
                    accept=".db,.sqlite"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  Choose Database File
                </label>
                <p className="file-info">Select a .db or .sqlite file (max 50MB)</p>
                <button 
                  className="modal-back-btn"
                  onClick={() => setModalMode("")}
                >
                  Back
                </button>
              </div>
            ) : (
              <div className="modal-create">
                <input
                  type="text"
                  placeholder="Enter database name"
                  value={createDbName}
                  onChange={(e) => setCreateDbName(e.target.value)}
                  className="create-input"
                />
                <div className="modal-actions">
                  <button 
                    className="modal-back-btn"
                    onClick={() => {
                      setModalMode("");
                      setCreateDbName("");
                    }}
                  >
                    Back
                  </button>
                  <button 
                    className="modal-create-btn"
                    onClick={handleCreateDatabase}
                  >
                    Create Database
                  </button>
                </div>
              </div>
            )}
            
            <button 
              className="modal-close-btn"
              onClick={() => {
                setModalOpen(false);
                setModalMode("");
                setCreateDbName("");
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
