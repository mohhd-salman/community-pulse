import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const navigate                = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.access_token);
      navigate("/");
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.msg || "";
      if (status === 403 || msg.toLowerCase().includes("banned")) {
        setError("Your account has been banned. Please contact support.");
      } else if (status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <form
        onSubmit={handleLogin}
        className="p-4 shadow bg-dark text-light rounded"
        style={{ minWidth: 320 }}
      >
        <h2 className="mb-4 text-center">Login</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label text-light">Email address</label>
          <input
            type="email"
            required
            className="form-control bg-secondary text-light border-secondary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
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
            placeholder="Enter password"
          />
        </div>

        <button type="submit" className="btn btn-maroon w-100">
          Login
        </button>
      </form>
    </div>
  );
}
