import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ title }) {
  const nav  = useNavigate();
  const user = JSON.parse(localStorage.getItem("bnpl_user") || "{}");

  const [open, setOpen] = useState(false);
  const dropdownRef     = useRef();

  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    nav("/login");
  };

  const initials = [user.first_name, user.last_name]
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .join("") || (user.username?.[0]?.toUpperCase() ?? "?");

  return (
    <nav className="navbar">
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="navbar-brand">
          <div className="navbar-logo">BP</div>
          <span className="navbar-app-name">BNPLPay</span>
        </div>
        <div className="navbar-divider" />
        <span className="navbar-page-title">{title}</span>
      </div>

      <div className="navbar-right" ref={dropdownRef}>
        <div
          className="navbar-user-info"
          onClick={() => setOpen(o => !o)}
          role="button"
          aria-expanded={open}
        >
          <div className="navbar-avatar">{initials}</div>
          <span className="navbar-username">{user.username}</span>
          <span className={`navbar-chevron ${open ? "open" : ""}`}>&#9660;</span>
        </div>

        {open && (
          <div className="navbar-dropdown">
            <div className="dropdown-header">
              <div className="dropdown-header-name">
                {[user.first_name, user.last_name].filter(Boolean).join(" ") || user.username}
              </div>
              <div className="dropdown-header-role">{user.role}</div>
            </div>
            <div className="dropdown-item" onClick={handleLogout}>
              Sign out
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
