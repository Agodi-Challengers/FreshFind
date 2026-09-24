import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import freshlogo from "../assets/freshlogo.png";
import { FaRegBookmark } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: "Find a Market", to: "/" },
    { label: "Directory", to: "/directory" },
    { label: "Produce Guide", to: "/guide" },
    { label: "Seasonal", to: "/seasonal" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: false,
    });
  }, []);

  useEffect(() => {
    if (menuOpen) {
      setTimeout(() => {
        AOS.refresh();
      }, 100);
    }
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="nav-bar">

        {/* Logo */}
        <NavLink className="brand" to="/">
          <img src={freshlogo} alt="FreshFind logo" />
        </NavLink>

        {/* Desktop Links */}
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

        {/* Desktop Actions */}
        <div className="nav-actions">

          <button className="saved-button" type="button">
            <span className="bookmark-icon">
              <FaRegBookmark />
            </span>

            <span>Saved</span>

            <span className="saved-count">3</span>
          </button>

          <NavLink className="login-button" to="/login">
            Log in
          </NavLink>

          <NavLink className="signup-button" to="/signup">
            Sign up
          </NavLink>

        </div>

        {/* Mobile Menu Button */}

        <button
          className="mobile-menu-button"
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <FiMenu />
        </button>

      </nav>

      {/* =========================
          MOBILE MENU
      ========================= */}

      <div
        className={`mobile-menu ${
          menuOpen ? "mobile-menu-open" : ""
        }`}
      >

        {/* Header */}
        <div
          className="mobile-menu-header"
          data-aos="fade-down"
        >

          <NavLink
            className="mobile-brand"
            to="/"
            onClick={closeMenu}
          >
            <img src={freshlogo} alt="FreshFind logo" />
          </NavLink>

          <button
            className="mobile-close-button"
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <FiX />
          </button>

        </div>

        {/* Links */}
        <div className="mobile-nav-links">

          {links.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={closeMenu}
              data-aos="fade-up"
              data-aos-delay={index * 80}
            >
              {link.label}
            </NavLink>
          ))}

        </div>

        {/* Bottom buttons */}
        <div className="mobile-menu-actions">
  <NavLink
    className="mobile-signup-button"
    to="/signup"
    onClick={closeMenu}
  >
    Sign up
  </NavLink>

  <NavLink
    className="mobile-login-button"
    to="/login"
    onClick={closeMenu}
  >
    Login
  </NavLink>
</div>

      </div>
    </>
  );
};

export default Navbar;