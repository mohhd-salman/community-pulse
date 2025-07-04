import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";

export default function EditPostModal({ show, post, onClose, onUpdated }) {
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [link, setLink]       = useState("");
  const [msg, setMsg]         = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (show && post) {
      setTitle(post.title || "");
      setContent(post.content || "");
      setLink(post.link || "");
      setMsg("");
      setSuccess(false);
    }
  }, [show, post]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    const token = localStorage.getItem("token");

    try {
      await axiosInstance.patch(
        `/api/posts/${post.id}`,
        { title: title.trim(), content: content.trim(), link: link.trim() || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setMsg("Post updated successfully!");

      onUpdated({
        id: post.id,
        title: title.trim(),
        content: content.trim(),
        link: link.trim() || null
      });

      setTimeout(onClose, 1000);
    } catch (err) {
      console.error("EditPostModal error:", err);
      setSuccess(false);
      setMsg("Update failed. Please try again.");
    }
  };

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ cursor: "pointer" }}
      />
      <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content bg-dark text-light shadow">
            <div className="modal-header">
              <h5 className="modal-title">Edit Post</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              {msg && (
                <div className={`alert ${success ? "alert-success" : "alert-danger"} py-1`}>
                  {msg}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control bg-secondary text-white border-secondary"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-control bg-secondary text-white border-secondary"
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Link (optional)</label>
                  <input
                    type="url"
                    className="form-control bg-secondary text-white border-secondary"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
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
                    Save Changes
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
