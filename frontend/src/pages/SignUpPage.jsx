import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import Icon from "../components/Icon.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function SignUpPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Those passwords do not match.");
      return;
    }
    setError("");
    toast("Demo build: sign up is not connected to a server");
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
            Create your account
          </h1>
          <p className="ff-lead">
            Save markets, keep notes and plan your market week.
          </p>
        </div>

        <form className="ff-form" onSubmit={onSubmit}>
          <label className="ff-field">
            <span className="ff-field-label">Your name</span>
            <input
              className="ff-input"
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="Amaka Obi"
              autoComplete="name"
              required
            />
          </label>

          <label className="ff-field">
            <span className="ff-field-label">Email</span>
            <input
              className="ff-input"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <div className="ff-form-row">
            <label className="ff-field">
              <span className="ff-field-label">Password</span>
              <input
                className="ff-input"
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </label>
            <label className="ff-field">
              <span className="ff-field-label">Confirm password</span>
              <input
                className="ff-input"
                type="password"
                value={form.confirm}
                onChange={set("confirm")}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </label>
          </div>

          {error && (
            <p className="ff-notice" role="alert">
              <Icon name="info" size={17} />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            className="ff-btn ff-btn--primary ff-btn--block ff-btn--lg"
          >
            <Icon name="user" size={16} />
            Create account
          </button>
        </form>

        <p className="ff-auth__alt">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
        <p className="ff-auth__aside">
          FreshFind has no server, so this form does not send or store your
          details. <Link to="/">Return to the site</Link>.
        </p>
      </div>
    </div>
  );
}
