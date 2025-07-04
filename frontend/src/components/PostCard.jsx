import { Link } from "react-router-dom";

function PostCard({ post }) {
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
          <a
            href={post.link}
            className="card-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {post.link}
          </a>
        )}

        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            By <strong>{post.author_name}</strong> on{" "}
            {new Date(post.created_at).toLocaleString()}
          </small>
          <div className="d-flex gap-3 align-items-center">
            <span>
              👍 <strong>{post.upvotes}</strong>
            </span>
            <span>
              👎 <strong>{post.downvotes}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
