import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function NewPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:5000/api/posts",
        {
          title,
          content,
          link,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMsg("Post created successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMsg("Failed to create post. Please try again.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={handleSubmit} className="p-4 shadow bg-light rounded" style={{ minWidth: 380 }}>
        <h2 className="mb-4 text-center">Create New Post</h2>

        {msg && <div className="alert alert-info">{msg}</div>}

        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input
            type="text"
            className="form-control"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Content</label>
          <textarea
            className="form-control"
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content (optional)"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Link</label>
          <input
            type="url"
            className="form-control"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com (optional)"
          />
        </div>

        <button type="submit" className="btn btn-success w-100">
          Submit Post
        </button>
      </form>
    </div>
  );
}

export default NewPost;
