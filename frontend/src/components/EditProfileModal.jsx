import { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";

export default function EditProfileModal({ show, user, onClose, onUpdated }) {
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg]     = useState("");

  useEffect(() => {
    if (show && user) {
      setName(user.name);
      setEmail(user.email);
      setMsg("");
    }
  }, [show, user]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return setMsg("Name and email are required");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.patch(
        "/api/auth/update",
        { name: name.trim(), email: email.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg("Profile updated!");
      onUpdated({ name: name.trim(), email: email.trim() });
    } catch (err) {
      console.error(err);
      setMsg("Update failed. Try again.");
    }
  };

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ cursor: "pointer" }}
      />
      <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content bg-dark text-white shadow">
            <div className="modal-header">
              <h5 className="modal-title">Edit Profile</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              {msg && <div className="alert alert-info py-1">{msg}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control bg-secondary text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control bg-secondary text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    Save
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
