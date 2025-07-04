import { useState } from "react";
import axios from "axios";

export default function NewPostModal({ show, onClose, onCreated }) {
  const [title,   setTitle]   = useState("");
  const [content, setContent] = useState("");
  const [link,    setLink]    = useState("");
  const [error,   setError]   = useState("");

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

      await axios.post(
        "http://localhost:5000/api/posts/",
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
      <div className="modal-backdrop fade show" onClick={onClose} style={{cursor:"pointer"}}/>
      <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5 className="modal-title">New Post</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}/>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-1">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Link (optional)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                  />
                </div>
                <div className="text-end">
                  <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
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
