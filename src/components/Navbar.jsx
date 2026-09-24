import "./Navbar.css";
import { NavLink } from "react-router-dom";
import freshlogo from "../assets/freshlogo.png";

const Navbar = () => {
  const links = [
    { label: "Find a Market", to: "/" },
    { label: "Directory", to: "/directory" },
    { label: "Produce Guide", to: "/guide" },
    { label: "Seasonal", to: "/seasonal" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <nav className="nav-bar" aria-label="Main navigation">

      {/* Logo */}
      <NavLink className="brand" to="/">
        <img src={freshlogo} alt="FreshFind logo" />
      </NavLink>

      {/* Navigation Links */}
      <div className="nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Right Side */}
      <div className="nav-actions">

        {/* Saved */}
        <button className="saved-button" type="button">
          <span className="bookmark-icon">♡</span>
          <span>Saved</span>
          <span className="saved-count">3</span>
        </button>

        {/* Login */}
        <NavLink className="login-button" to="/login">
          Log in
        </NavLink>

        {/* Sign Up */}
        <NavLink className="signup-button" to="/signup">
          Sign up
        </NavLink>

      </div>

    </nav>
  );
};

export default Navbar;