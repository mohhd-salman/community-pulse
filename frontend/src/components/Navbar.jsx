import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin]     = useState(false);

  const doLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axiosInstance.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setIsLoggedIn(true))
      .catch(() => doLogout());
  }, [navigate]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem("token");
    axiosInstance.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setIsAdmin(data.is_admin))
      .catch(() => setIsAdmin(false));
  }, [isLoggedIn]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">Community Pulse</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navContent"
          aria-controls="navContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navContent">
          <ul className="navbar-nav mb-2 mb-lg-0">
            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
                {isAdmin && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/dashboard">Admin</Link>
                  </li>
                )}
                <li className="nav-item">
                  <button className="btn btn-outline-light ms-2" onClick={doLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
