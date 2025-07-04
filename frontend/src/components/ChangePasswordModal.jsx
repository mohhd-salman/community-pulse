import { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";

export default function ChangePasswordModal({ show, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg]                 = useState("");
  const [success, setSuccess]         = useState(false);

  useEffect(() => {
    if (show) {
      setOldPassword("");
      setNewPassword("");
      setMsg("");
      setSuccess(false);
    }
  }, [show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    const token = localStorage.getItem("token");

    try {
      await axiosInstance.patch(
        "/api/auth/change-password",
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setMsg("Password updated successfully!");
      setTimeout(onClose, 2000);
    } catch (err) {
      setSuccess(false);
      setMsg(
        err.response?.status === 403
          ? "Current password is incorrect."
          : "Failed to change password. Try again."
      );
    }
  };

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ cursor: "pointer" }}
      />
      <div className="modal d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content bg-dark text-light">
            <div className="modal-header">
              <h5 className="modal-title">Change Password</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              {msg && (
                <div
                  className={`alert ${
                    success ? "alert-success" : "alert-danger"
                  } py-1`}
                >
                  {msg}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-light">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    className="form-control bg-secondary text-light border-secondary"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-light">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    className="form-control bg-secondary text-light border-secondary"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="text-end">
                  <button
                    type="button"
                    className="btn btn-outline-light me-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-maroon">
                    Change
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
