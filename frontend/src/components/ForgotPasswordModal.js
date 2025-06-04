// src/components/ForgotPasswordModal.js
import React, { useState } from "react";

const ForgotPasswordModal = ({ onClose, onBack }) => {
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      // Здесь можно послать fetch на /api/v1/auth/forgot,
      // пока просто показываем сообщение:
      setMessage(
        "If an account with that email exists, you’ll receive a reset link shortly."
      );
    } catch {
      setError("Server error, please try later");
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>&times;</button>
        <h2 className="auth-title">Forgot your password?</h2>
        <p className="mb-3">
          Enter your email address and we'll send you a link to set your password.
        </p>

        {error && <div className="text-danger mb-2">{error}</div>}
        {message && <div className="text-success mb-3">{message}</div>}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter email"
            className="form-control mb-3"
            required
          />

          <button type="submit" className="btn btn-primary w-100 mb-2">
            Send
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={onBack}
          >
            Know your password? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;