import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";

export default function Register() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg]           = useState("");
  const navigate                = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await axiosInstance.post("/api/auth/register", {
        name,
        email,
        password,
      });
      setMsg("Registration successful! Redirecting…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMsg("Registration failed. Email may already be in use.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <form
        onSubmit={handleRegister}
        className="p-4 shadow bg-dark text-light rounded"
        style={{ minWidth: 320 }}
      >
        <h2 className="mb-4 text-center">Register</h2>

        {msg && (
          <div
            className={`alert ${
              msg.startsWith("Registration successful") ? "alert-success" : "alert-danger"
            }`}
          >
            {msg}
          </div>
        )}

        <div className="mb-3">
          <label className="form-label text-light">Full Name</label>
          <input
            type="text"
            required
            className="form-control bg-secondary text-light border-secondary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-light">Email address</label>
          <input
            type="email"
            required
            className="form-control bg-secondary text-light border-secondary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-light">Password</label>
          <input
            type="password"
            required
            className="form-control bg-secondary text-light border-secondary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password"
          />
        </div>

        <button type="submit" className="btn btn-maroon w-100">
          Register
        </button>
      </form>
    </div>
  );
}
