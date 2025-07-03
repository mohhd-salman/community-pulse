import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function PostCard({ post, showControls, onDelete }) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${post.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onDelete(post.id); // trigger refresh
    } catch (err) {
      alert("Failed to delete post.");
    }
  };

  return (
    <div className="card mb-3 shadow">
      <div className="card-body">
        <h5 className="card-title">
            <Link to={`/posts/${post.id}`} className="text-decoration-none">
                {post.title}
            </Link>
        </h5>
        {post.content && <p className="card-text">{post.content}</p>}
        {post.link && (
          <a href={post.link} className="card-link" target="_blank" rel="noopener noreferrer">
            {post.link}
          </a>
        )}
        <p className="text-muted mt-2">
          By <strong>{post.author?.name}</strong> on{" "}
          {new Date(post.created_at).toLocaleString()}
        </p>

        {showControls && (
          <div className="mt-2">
            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => navigate(`/edit-post/${post.id}`)}>
              Edit
            </button>
            <button className="btn btn-sm btn-outline-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostCard;
