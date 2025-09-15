import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPasswordPage.css";
import { forgotPasswordFetch } from "../fetchers/authFetch";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPasswordFetch(email.trim());
      
      // Check the response message to determine if email exists
      if (response.message && response.message.includes("sent")) {
        setSuccess(true);
      } else {
        setError("Email not found. Please check your email address or sign up for a new account.");
      }
    } catch (err) {
      // Handle different error types
      if (err.message && err.message.includes("not found")) {
        setError("Email not found. Please check your email address or sign up for a new account.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate("/auth");
  };

  if (success) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="success-icon">✓</div>
          <h1>Check Your Email</h1>
          <p className="success-message">
            If an account exists with this email address, we've sent a password reset link.
          </p>
          <p className="success-subtitle">
            Please check your email and follow the instructions to reset your password.
          </p>
          <button 
            className="back-to-signin-btn" 
            onClick={handleBackToSignIn}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h1>Forgot Password?</h1>
        <p className="forgot-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="error-msg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            className={
              touched && (!email.trim() || !validateEmail(email)) ? "invalid-input" : ""
            }
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="back-link">
          Remember your password?{" "}
          <span onClick={handleBackToSignIn}>Back to Sign In</span>
        </p>
      </div>
    </div>
  );
}
