import { useState } from "react";
import axiosInstance from "../axiosInstance";

export default function NewPostModal({ show, onClose, onCreated }) {
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [link, setLink]       = useState("");
  const [error, setError]     = useState("");

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = { title, content };
      if (link.trim()) payload.link = link.trim();

      await axiosInstance.post(
        "/api/posts/",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onCreated();
      setTitle("");
      setContent("");
      setLink("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to create post");
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
          <div className="modal-content bg-dark text-light shadow-lg">
            <div className="modal-header border-0">
              <h5 className="modal-title">New Post</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-danger py-1">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control bg-secondary text-light border-0"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-control bg-secondary text-light border-0"
                    rows="4"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Link (optional)</label>
                  <input
                    type="url"
                    className="form-control bg-secondary text-light border-0"
                    placeholder="https://example.com"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-maroon">
                    Publish
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
