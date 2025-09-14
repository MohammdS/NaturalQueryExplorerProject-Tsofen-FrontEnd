import { useNavigate } from "react-router-dom";
import "./HistoryPage.css";

export default function HistoryPage() {
  const navigate = useNavigate();

  // Mock history data for now
  const history = [
    {
      dbName: "test.db",
      sessionId: 1,
      date: "Sep 12, 2025, 10:30 PM",
      queries: ["Show me all users", "List all products"],
    },
    {
      dbName: "sales_data.db",
      sessionId: 2,
      date: "Sep 11, 2025, 4:15 PM",
      queries: ["Top 10 customers", "Total sales by region"],
    },
  ];

  const openSession = (dbName, sessionId) => {
    navigate("/query", { state: { selectedDb: dbName, sessionId } });
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h1> History</h1>
        <button
          className="back-btn"
          onClick={() => navigate("/databases")}
        >
          Back
        </button>
      </div>

      {history.length === 0 ? (
        <p>No history yet</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.sessionId} className="history-card">
              <div className="history-info">
                <h2>{item.dbName}</h2>
                <p className="date"> {item.date}</p>
              </div>
              <ul>
                {item.queries.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
              <button
                className="open-btn"
                onClick={() => openSession(item.dbName, item.sessionId)}
              >
                Open Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
