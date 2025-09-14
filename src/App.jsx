import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import DatabasesPage from "./pages/DatabasesPage";
import QueryPage from "./pages/QueryPage";
import HistoryPage from "./pages/HistoryPage"; // ✅ import

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/databases" element={<DatabasesPage />} />
      <Route path="/query" element={<QueryPage />} />
      <Route path="/history" element={<HistoryPage />} /> {/* ✅ route */}
    </Routes>
  );
}

export default App;
