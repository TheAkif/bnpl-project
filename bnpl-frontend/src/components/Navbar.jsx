import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ title }) {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("bnpl_user") || "{}");

  const [open, setOpen] = useState(false);
  const userRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
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

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.username
  )}&size=64&background=dddddd&color=555555`;

  return (
    <nav className="navbar">
      <h1 className="navbar-title">{title}</h1>

      <div className="navbar-user" ref={userRef}>
        <img
          src={avatarUrl}
          alt="User avatar"
          className="navbar-avatar"
          onClick={() => setOpen((o) => !o)}
        />
        {/* Dropdown */}
        {open && (
          <div className="navbar-dropdown">
            <div className="dropdown-item" onClick={handleLogout}>
              Logout
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
