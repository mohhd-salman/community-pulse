import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UpdateProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user info
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setName(res.data.name);
        setEmail(res.data.email);
      })
      .catch((err) => {
        setMsg("Failed to load profile.");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      });
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.patch(
        "http://localhost:5000/api/auth/update",
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg("Profile updated successfully!");
    } catch (err) {
      setMsg("Update failed. Try again.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={handleUpdate} className="p-4 shadow bg-light rounded" style={{ minWidth: 320 }}>
        <h2 className="mb-4 text-center">Update Profile</h2>

        {msg && <div className="alert alert-info">{msg}</div>}

        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            required
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            required
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>

        <button type="submit" className="btn btn-success w-100">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default UpdateProfile;
