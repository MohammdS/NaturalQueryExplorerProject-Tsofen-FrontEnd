import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";
import { signupFetch, signinFetch } from "../fetchers/authFetch";
import { verifyFetch } from "../fetchers/verifyFetch";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});
  const [showAbout, setShowAbout] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer((t) => t - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

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
    if (isSignup && !formData.name.trim()) messages.push("Name is required");
    if (!formData.email.trim()) messages.push("Email is required");
    if (!formData.password.trim()) messages.push("Password is required");
    if (isSignup && !formData.confirmPassword.trim())
      messages.push("Confirm Password is required");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      messages.push("Please enter a valid email address");
    }

    if (isSignup && formData.password && !isStrongPassword(formData.password)) {
      messages.push(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
    }

    if (
      isSignup &&
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      messages.push("Passwords do not match");
    }
    return messages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ If verifying code
    if (isVerifying) {
      try {
        setLoading(true);
        const result = await verifyFetch({
          email: formData.email.trim(),
          code: verificationCode,
        });
        // ✅ Save token
        localStorage.setItem("token", result.token);
        setShowVerifyModal(false);
        navigate("/databases");
      } catch (err) {
        setError(err.message || "Invalid verification code");
      } finally {
        setLoading(false);
      }
      return;
    }

    const messages = validateInputs();
    if (messages.length > 0) {
      setError(messages.join("\n"));
      return;
    }

    try {
      setLoading(true);

      if (isSignup) {
        // ✅ Show modal immediately
        setIsVerifying(true);
        setShowVerifyModal(true);
        setTimer(30);
        setError("");

        // Call backend in background
        signupFetch({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }).catch(() => {
          setError("Could not send verification email. Try again.");
          setIsVerifying(false);
          setShowVerifyModal(false);
        });
      } else {
        const result = await signinFetch({
          email: formData.email.trim(),
          password: formData.password,
        });
        // ✅ Save token
        localStorage.setItem("token", result.token);
        navigate("/databases");
      }
    } catch (err) {
      let msg = err.message || "Something went wrong";

      if (msg === "Invalid credentials") {
        msg = "Email or password is incorrect";
      }
      if (msg === "Email already in use") {
        msg = "This email already in use. Try signing in instead.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend code
  const handleResend = () => {
    setTimer(30);
    setVerificationCode("");
    setError("");
    signupFetch({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    }).catch(() => {
      setError("Could not resend code. Try again.");
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isSignup ? (isVerifying ? "Verify Email" : "Sign Up") : "Sign In"}</h1>

        {error && !isVerifying && (
          <div className="error-msg">
            {error.split("\n").map((line, i) => (
              <div key={i}>• {line}</div>
            ))}
          </div>
        )}

        {!isVerifying ? (
          <form onSubmit={handleSubmit} noValidate>
            {isSignup && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.name && formData.name.trim() === "" ? "invalid-input" : ""
                }
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.email && formData.email.trim() === "" ? "invalid-input" : ""
              }
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.password && formData.password.trim() === ""
                  ? "invalid-input"
                  : ""
              }
            />

            {isSignup && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.confirmPassword && formData.confirmPassword.trim() === ""
                    ? "invalid-input"
                    : ""
                }
              />
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Please wait…" : isSignup ? "Sign Up" : "Sign In"}
            </button>
          </form>
        ) : null}

        {!isVerifying && (
          <>
            <p className="toggle-text">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <span
                onClick={() => {
                  setIsSignup(!isSignup);
                  setIsVerifying(false);
                  setError("");
                  setTouched({});
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                  });
                }}
              >
                {isSignup ? "Sign In" : "Sign Up"}
              </span>
            </p>

            <button className="guest-btn" onClick={() => navigate("/databases")}>
              Continue as Guest
            </button>
          </>
        )}
      </div>

      {/* About Us button */}
      <button className="about-btn" onClick={() => setShowAbout(true)}>
        About Us
      </button>

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="modal-content verify-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowVerifyModal(false)}>
              ✖
            </button>
            <h2>Email Verification</h2>

            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="verify-input"
            />

            <button
              onClick={timer > 0 ? handleSubmit : handleResend}
              disabled={loading}
              className="verify-btn"
            >
              {loading
                ? "Please wait…"
                : timer > 0
                ? `Verify (${timer}s)`
                : "Resend Code"}
            </button>

            {error && isVerifying && <div className="verify-error">{error}</div>}
          </div>
        </div>
      )}

      {/* About Us modal */}
      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAbout(false)}>
              ✖
            </button>
            <h2>About Us</h2>
            <p>
              This project was developed as part of the Dell–Tsofen program (2025).
              It allows users to upload databases and query them using natural language.
              The system translates questions into SQL and displays results.
            </p>
            <p>
              <strong>Team:</strong> Student Project – University of Haifa
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
