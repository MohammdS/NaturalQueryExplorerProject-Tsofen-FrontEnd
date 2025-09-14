import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiSend } from "react-icons/fi";
import "./QueryPage.css";

export default function QueryPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

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

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", text: input };

    // Mock system response for now
    const mockResponse = {
      role: "system",
      text: `SQL: SELECT * FROM users;\nResults:\n1 | Alice | alice@example.com\n2 | Bob | bob@example.com`,
    };

    // ✅ Append correctly
    setMessages((prev) => [...prev, newMessage, mockResponse]);
    setInput("");
  };

  return (
    <div className="query-container">
      <div className="query-inner">
      <header className="query-header">
        <span>
            <strong>{selectedDb.originalName}</strong>
        </span>
        <button onClick={() => navigate("/databases")}>Back</button>
      </header>

        <div className="chat-window">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-bubble ${msg.role === "user" ? "user" : "system"}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Type your query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} className="send-btn">
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
