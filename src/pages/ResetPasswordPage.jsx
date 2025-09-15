import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResetPasswordPage.css";
import { resetPasswordFetch } from "../fetchers/authFetch";

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({});
  const [token, setToken] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Extract token from URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (!tokenFromUrl) {
      setError("Invalid or missing reset token. Please request a new reset email.");
      return;
    }
    
    setToken(tokenFromUrl);
  }, [location.search]);

  const isStrongPassword = (password) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    return (
      typeof password === "string" &&
      password.length >= minLength &&
      hasUpper &&
      hasLower &&
      hasDigit &&
      hasSpecial
    );
  };

  const validateInputs = () => {
    let messages = [];
    
    if (!formData.newPassword.trim()) {
      messages.push("New password is required");
    } else if (!isStrongPassword(formData.newPassword)) {
      messages.push("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
    }
    
    if (!formData.confirmPassword.trim()) {
      messages.push("Confirm password is required");
    }
    
    if (formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
      messages.push("Passwords do not match");
    }
    
    return messages;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const messages = validateInputs();
    if (messages.length > 0) {
      setError(messages.join("\n"));
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token. Please request a new reset email.");
      return;
    }

    try {
      setLoading(true);
      await resetPasswordFetch(token, formData.newPassword);
      setSuccess(true);
      
      // Auto-redirect to auth page after 3 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (err) {
      let msg = err.message || "Something went wrong. Please try again.";
      
      if (msg.includes("expired") || msg.includes("invalid")) {
        msg = "Invalid or expired link. Please request a new reset email.";
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForgotPassword = () => {
    navigate("/forgot-password");
  };

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="success-icon">✓</div>
          <h1>Password Updated!</h1>
          <p className="success-message">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
          <p className="success-subtitle">
            Redirecting you to the sign-in page...
          </p>
          <button 
            className="back-to-signin-btn" 
            onClick={() => navigate("/auth")}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h1>Reset Password</h1>
        <p className="reset-subtitle">
          Enter your new password below.
        </p>

        {error && (
          <div className="error-msg">
            {error.split("\n").map((line, i) => (
              <div key={i}>• {line}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={
              touched.newPassword && (!formData.newPassword.trim() || !isStrongPassword(formData.newPassword))
                ? "invalid-input"
                : ""
            }
            disabled={loading}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={
              touched.confirmPassword && (!formData.confirmPassword.trim() || formData.newPassword !== formData.confirmPassword)
                ? "invalid-input"
                : ""
            }
            disabled={loading}
          />

          <button type="submit" disabled={loading || !token}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {error && error.includes("Invalid or expired") && (
          <p className="back-link">
            <span onClick={handleBackToForgotPassword}>
              Request a new reset email
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
