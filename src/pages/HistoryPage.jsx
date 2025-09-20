import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getHistoryFetch } from "../fetchers/historyFetch";
import { getDbsFetch } from "../fetchers/dbsFetch";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState("");
  const [databaseFilter, setDatabaseFilter] = useState("");
  const [allDatabases, setAllDatabases] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadHistoryAndDatabases() {
      try {
        setLoading(true);
        setError("");
        
        // Load both history and databases in parallel
        const [historyData, databasesData] = await Promise.all([
          getHistoryFetch(token),
          getDbsFetch(token)
        ]);
        
        console.log("=== HISTORY DATA DEBUG ===");
        console.log("Raw history data:", historyData);
        console.log("First item:", historyData[0]);
        
        // Handle different response structures for history
        let finalHistory = [];
        if (Array.isArray(historyData)) {
          finalHistory = historyData;
        } else if (historyData && Array.isArray(historyData.history)) {
          finalHistory = historyData.history;
        } else if (historyData && Array.isArray(historyData.data)) {
          finalHistory = historyData.data;
        } else {
          finalHistory = [];
        }
        
        console.log("Final history items:", finalHistory);
        setHistory(finalHistory);
        
        // Handle databases data
        let finalDatabases = [];
        if (Array.isArray(databasesData)) {
          finalDatabases = databasesData;
        } else if (databasesData && Array.isArray(databasesData.databases)) {
          finalDatabases = databasesData.databases;
        } else if (databasesData && Array.isArray(databasesData.data)) {
          finalDatabases = databasesData.data;
        } else {
          finalDatabases = [];
        }
        
        console.log("All databases:", finalDatabases);
        setAllDatabases(finalDatabases);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadHistoryAndDatabases();
    } else {
      navigate("/auth");
    }
  }, [token, navigate]);

  // Get all available databases for filter dropdown
  const availableDatabases = useMemo(() => {
    return allDatabases.map(db => {
      // Handle different database object structures
      const originalName = db.originalName || db.name || db.filename || db.storedFilename || "Unknown";
      return originalName.replace(/^\d+_/, '');
    }).sort();
  }, [allDatabases]);

  // Search and filter logic
  const filteredHistory = useMemo(() => {
    let filtered = [...history];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const prompt = (item.prompt || item.naturalLanguageQuery || item.query || "").toLowerCase();
        const sql = (item.sql || item.generatedSQL || item.finalSQL || "").toLowerCase();
        return prompt.includes(query) || sql.includes(query);
      });
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
        return itemDate === dateFilter;
      });
    }

    // Database filter
    if (databaseFilter) {
      filtered = filtered.filter(item => {
        const dbName = (item.dbFilename || item.databaseName || "Unknown").replace(/^\d+_/, '');
        return dbName === databaseFilter;
      });
    }

    return filtered;
  }, [history, searchQuery, dateFilter, databaseFilter]);


  if (loading) {
    return (
      <div style={{ 
        padding: "2rem", 
        background: "linear-gradient(135deg, #F5EFE7 0%, #D8C4B6 100%)", 
        minHeight: "100vh", 
        fontFamily: "system-ui, sans-serif" 
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div style={{
              width: "60px",
              height: "60px",
              border: "4px solid #D8C4B6",
              borderTop: "4px solid #213555",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 2rem"
            }}></div>
            <h1 style={{ color: "#213555", margin: "0 0 1rem", fontSize: "2rem", fontWeight: "600" }}>Loading History</h1>
            <p style={{ color: "#666", fontSize: "1.1rem" }}>Fetching your query history...</p>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes expandSearch {
            0% { 
              width: 50px; 
              opacity: 0.8; 
            }
            100% { 
              width: 350px; 
              opacity: 1; 
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "2rem", 
      background: "linear-gradient(135deg, #F5EFE7 0%, #D8C4B6 100%)", 
      minHeight: "100vh", 
      fontFamily: "system-ui, sans-serif" 
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Header Section */}
        <div style={{
          marginBottom: "2rem"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between"
          }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: "2rem", 
                fontWeight: "700",
                background: "linear-gradient(135deg, #213555 0%, #3E5879 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>History</h1>
            </div>
        <button
              style={{
                background: "linear-gradient(135deg, #213555 0%, #3E5879 100%)",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
                boxShadow: "0 2px 8px rgba(33, 53, 85, 0.3)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 12px rgba(33, 53, 85, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(33, 53, 85, 0.3)";
              }}
          onClick={() => navigate("/databases")}
        >
              ← Back to Databases
        </button>
      </div>
        </div>

        {/* Search Bar and Filters */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem"
        }}>
          {/* Date Filter */}
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "0.5rem 1rem",
            border: "2px solid #D8C4B6",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease"
          }}>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "0.9rem",
                color: "#213555",
                cursor: "pointer"
              }}
              title="Filter by date"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
                  cursor: "pointer",
                  fontSize: "1rem",
                  padding: "0.1rem 0.3rem",
                  marginLeft: "0.5rem"
                }}
                title="Clear date filter"
              >
                ✕
              </button>
            )}
          </div>

          {/* Database Filter */}
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "0.5rem 1rem",
            border: "2px solid #D8C4B6",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease"
          }}>
            <select
              value={databaseFilter}
              onChange={(e) => setDatabaseFilter(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "0.9rem",
                color: "#213555",
                cursor: "pointer",
                minWidth: "120px"
              }}
              title="Filter by database"
            >
              <option value="">All Databases</option>
              {availableDatabases.map(db => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>
            {databaseFilter && (
              <button
                onClick={() => setDatabaseFilter("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
                  cursor: "pointer",
                  fontSize: "1rem",
                  padding: "0.1rem 0.3rem",
                  marginLeft: "0.5rem"
                }}
                title="Clear database filter"
              >
                ✕
              </button>
            )}
          </div>

          <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center"
          }}>
            {!searchExpanded ? (
              <button
                onClick={() => setSearchExpanded(true)}
                style={{
                  background: "none",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "1.8rem",
                  color: "#213555",
                  transition: "all 0.3s ease",
                  padding: "0.5rem",
                  outline: "none"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "scale(1.1)";
                  e.target.style.color = "#3E5879";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.color = "#213555";
                }}
              >
                ⌕
              </button>
            ) : (
              <div 
                onMouseLeave={() => {
                  if (!searchQuery.trim() && !dateFilter && !databaseFilter) {
                    setSearchExpanded(false);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "20px",
                  padding: "0.5rem 1rem",
                  border: "2px solid #D8C4B6",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(10px)",
                  animation: "expandSearch 0.3s ease-out"
                }}>
                <input
                  type="text"
                  placeholder="Search queries and SQL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "0.9rem",
                    color: "#213555",
                    width: "200px",
                    padding: "0.5rem"
                  }}
                />
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDateFilter("");
                    setDatabaseFilter("");
                    setSearchExpanded(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    padding: "0.25rem",
                    marginLeft: "0.5rem"
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Error Message */}
        {error && (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "2rem",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
            border: "2px solid #ff6b6b",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "40px",
                height: "40px",
                background: "#ff6b6b",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bold"
              }}>!</div>
              <div>
                <h3 style={{ margin: "0 0 0.5rem", color: "#d63031", fontSize: "1.2rem" }}>Error Loading History</h3>
                <p style={{ margin: 0, color: "#666" }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {history.length === 0 ? (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "4rem 2rem",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #D8C4B6 0%, #F5EFE7 100%)",
              borderRadius: "50%",
              margin: "0 auto 2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              color: "#213555"
            }}>📊</div>
            <h2 style={{ 
              color: "#213555", 
              margin: "0 0 1rem", 
              fontSize: "1.8rem",
              fontWeight: "600"
            }}>No History Yet</h2>
            <p style={{ 
              color: "#666", 
              fontSize: "1.1rem", 
              margin: "0 0 2rem",
              lineHeight: "1.6"
            }}>Start exploring your databases with natural language queries to see your history here</p>
              <button
              style={{
                background: "linear-gradient(135deg, #213555 0%, #3E5879 100%)",
                color: "white",
                border: "none",
                padding: "1rem 2rem",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                boxShadow: "0 4px 15px rgba(33, 53, 85, 0.3)",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(33, 53, 85, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(33, 53, 85, 0.3)";
              }}
              onClick={() => navigate("/databases")}
            >
              Start Querying →
            </button>
          </div>
        ) : filteredHistory.length === 0 && searchQuery ? (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "16px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}>
            <p style={{ 
              color: "#666", 
              fontSize: "1.1rem", 
              margin: 0,
              lineHeight: "1.6"
            }}>There are no results found for "{searchQuery}"</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {filteredHistory.map((item, index) => (
              <div key={item._id || index} style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: "1.5rem",
                borderRadius: "16px",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
              }}
              onClick={() => {
                // Create database object similar to what DatabasesPage would provide
                const dbName = item.dbFilename || item.databaseName || "Unknown";
                const selectedDb = {
                  originalName: dbName.replace(/^\d+_/, ''),
                  storedFilename: dbName,
                  filename: dbName,
                  name: dbName.replace(/^\d+_/, ''),
                  _id: item.dbId || item._id
                };
                
                // Navigate to query page with pre-filled data
                // Load both prompt and SQL so user can run again
                const naturalLanguageQuery = item.prompt || item.naturalLanguageQuery || item.query || "";
                const sqlQuery = item.sql || item.generatedSQL || item.finalSQL || "";
                navigate("/query", {
                  state: {
                    selectedDb: selectedDb,
                    preFilledQuery: naturalLanguageQuery,
                    preFilledSQL: sqlQuery, // Pre-fill both prompt and SQL
                    fromHistory: true
                  }
                });
              }}
              >
                {/* Card Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                  paddingBottom: "0.8rem",
                  borderBottom: "2px solid rgba(216, 196, 182, 0.3)"
                }}>
                  {/* Database Badge */}
                  <div style={{
                    background: "linear-gradient(135deg, #213555 0%, #3E5879 100%)",
                    padding: "0.25rem 0.7rem",
                    borderRadius: "16px",
                    boxShadow: "0 2px 8px rgba(33, 53, 85, 0.2)"
                  }}>
                    <span style={{ 
                      color: "white", 
                      fontSize: "0.75rem", 
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.3px"
                    }}>
                      {(() => {
                        const dbName = item.dbFilename || item.databaseName || "Unknown";
                        return dbName.replace(/^\d+_/, '');
                      })()}
                    </span>
                  </div>
                  
                  <div>
                    <p style={{ 
                      margin: 0, 
                      color: "#666", 
                      fontSize: "0.9rem",
                      fontWeight: "500"
                    }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "No date"}
                    </p>
                  </div>
                </div>
                
                {/* Content Grid */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "1.5rem",
                  "@media (max-width: 768px)": {
                    gridTemplateColumns: "1fr"
                  }
                }}>
                  {/* Prompt Section */}
                  <div style={{ 
                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(216, 196, 182, 0.3)",
                    position: "relative"
                  }}>
                    <div style={{
                      position: "absolute",
                      top: "-8px",
                      left: "1rem",
                      background: "#D8C4B6",
                      color: "#213555",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Natural Language</div>
                    <div style={{
                      marginTop: "0.5rem",
                      fontSize: "1rem",
                      lineHeight: "1.6",
                      color: "#333",
                      fontStyle: "italic"
                    }}>
                      {item.prompt || item.naturalLanguageQuery || item.query || "No prompt available"}
                    </div>
                  </div>
                  
                  {/* SQL Section */}
                  <div style={{ 
                    background: "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(33, 53, 85, 0.2)",
                    position: "relative"
                  }}>
                    <div style={{
                      position: "absolute",
                      top: "-8px",
                      left: "1rem",
                      background: "#213555",
                      color: "white",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Generated SQL</div>
                    <div style={{
                      marginTop: "0.5rem",
                      fontFamily: "'Courier New', 'Monaco', monospace",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                      color: "#333",
                      background: "rgba(255, 255, 255, 0.7)",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap"
                    }}>
                      {item.sql || item.generatedSQL || item.finalSQL || "No SQL available"}
                    </div>
                  </div>
                </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
