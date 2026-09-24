import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import Icon from "../components/Icon.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    toast("Demo build: log in is not connected to a server");
    navigate("/");
  };

  return (
    <div className="ff-auth">
      <div className="ff-auth__card">
        <div className="ff-auth__head">
          <Logo />
          <h1
            className="ff-section-title"
            style={{ fontSize: 28, marginTop: 10 }}
          >
            Welcome back
          </h1>
          <p className="ff-lead">Pick up your saved markets and notes.</p>
        </div>

        <form className="ff-form" onSubmit={onSubmit}>
          <label className="ff-field">
            <span className="ff-field-label">Email</span>
            <input
              className="ff-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="ff-field">
            <span className="ff-field-label">Password</span>
            <span style={{ position: "relative", display: "block" }}>
              <input
                className="ff-input"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="ff-icon-btn"
                style={{ position: "absolute", right: 8, top: 7 }}
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((s) => !s)}
              >
                <Icon name={show ? "eye-off" : "eye"} size={16} />
              </button>
            </span>
          </label>

          <button
            type="submit"
            className="ff-btn ff-btn--primary ff-btn--block ff-btn--lg"
          >
            <Icon name="lock" size={16} />
            Log in
          </button>
        </form>

        <p className="ff-auth__alt">
          New here? <Link to="/signup">Create an account</Link>
        </p>
        <p className="ff-auth__aside">
          FreshFind has no server, so this form does not send or store your
          details. <Link to="/">Return to the site</Link>.
        </p>
      </div>
    </div>
  );
}
