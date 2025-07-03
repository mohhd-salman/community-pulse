import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.patch(
        "http://localhost:5000/api/auth/change-password",
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMsg("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setMsg("Failed to change password. Check your current password.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={handlePasswordChange} className="p-4 shadow bg-light rounded" style={{ minWidth: 320 }}>
        <h2 className="mb-4 text-center">Change Password</h2>

        {msg && <div className="alert alert-info">{msg}</div>}

        <div className="mb-3">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            className="form-control"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            placeholder="Enter current password"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Enter new password"
          />
        </div>

        <button type="submit" className="btn btn-warning w-100">
          Change Password
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
