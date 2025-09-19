import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import DatabasesPage from "./pages/DatabasesPage";
import QueryPage from "./pages/QueryPage";
import HistoryPage from "./pages/HistoryPage"; // Back to original
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/databases" element={<DatabasesPage />} />
      <Route path="/query" element={<QueryPage />} />
      <Route path="/history" element={<HistoryPage />} /> {/* Back to original */}
    </Routes>
  );
}

export default App;
