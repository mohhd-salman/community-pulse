import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditPost() {
  const { postId } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts`);
        const post = res.data.find((p) => p.id === parseInt(postId));
        if (!post) return setMsg("Post not found");

        setTitle(post.title || "");
        setContent(post.content || "");
        setLink(post.link || "");
      } catch (err) {
        setMsg("Failed to load post");
      }
    };

    fetchPost();
  }, [postId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `http://localhost:5000/api/posts/${postId}`,
        { title, content, link },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMsg("Post updated!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setMsg("Update failed");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Edit Post</h2>
      {msg && <div className="alert alert-info">{msg}</div>}
      <form onSubmit={handleUpdate} className="shadow p-4 bg-light rounded">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            required
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Content</label>
          <textarea
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Link (optional)</label>
          <input
            type="url"
            className="form-control"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditPost;
