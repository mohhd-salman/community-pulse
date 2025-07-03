import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [collapsedComments, setCollapsedComments] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPost();
    fetchComments();
    fetchUser();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(res.data);
      setVotes(res.data.upvotes - res.data.downvotes);
      setUserVote(res.data.user_vote || null);
    } catch (err) {
      setError("Failed to load post.");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/comments?post_id=${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);

      // Auto-collapse all replies initially
      const collapsed = {};
      res.data.forEach((comment) => {
        if (comment.parent_id) collapsed[comment.id] = true;
      });
      setCollapsedComments(collapsed);
    } catch (err) {
      console.error("Error loading comments.");
    }
  };

  const toggleCollapse = (commentId) => {
    setCollapsedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const fetchUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Error loading user.");
    }
  };

  const handleVote = async (direction) => {
    if (!user) return;

    try {
      await axios.post(
        `http://localhost:5000/api/votes`,
        { post_id: postId, vote_type: direction },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let delta = 0;
      if (userVote === direction) {
        delta = direction === "up" ? -1 : 1;
        setUserVote(null);
      } else if (!userVote) {
        delta = direction === "up" ? 1 : -1;
        setUserVote(direction);
      } else {
        delta = direction === "up" ? 2 : -2;
        setUserVote(direction);
      }

      setVotes((v) => v + delta);
    } catch (err) {
      console.error("Vote failed", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axios.post(
        `http://localhost:5000/api/comments`,
        { post_id: postId, content: newComment, parent_id: replyTo || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      setReplyTo(null);
      fetchComments();
    } catch (err) {
      console.error("Failed to submit comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
    } catch (err) {
      alert("Failed to delete comment.");
    }
  };

  const nestComments = (comments) => {
    const map = {};
    const roots = [];

    const sorted = [...comments].sort((a, b) => {
      return sortOrder === "newest"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at);
    });

    sorted.forEach((c) => {
      c.replies = [];
      map[c.id] = c;
    });

    sorted.forEach((c) => {
      if (c.parent_id) {
        map[c.parent_id]?.replies.push(c);
      } else {
        roots.push(c);
      }
    });

    return roots;
  };

  const renderComment = (comment, depth = 0) => {
    const isCollapsed = collapsedComments[comment.id];
    const canReply = depth < 3;

    return (
      <div
        key={comment.id}
        style={{
          marginLeft: depth * 20,
          background: depth > 0 ? "#f7f9fb" : "#fff",
          borderLeft: depth > 0 ? "3px solid #cce" : "",
          padding: "0.75rem",
          borderRadius: "6px",
        }}
        className="mb-3 shadow-sm"
      >
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <strong>{comment.author?.name}</strong>: {comment.content}
            <div className="text-muted small">{new Date(comment.created_at).toLocaleString()}</div>
          </div>
          {user && (user.id === comment.author?.id || user.id === post.author?.id) && (
            <button
              className="btn btn-sm btn-outline-danger"
              title="Delete Comment"
              onClick={() => handleDeleteComment(comment.id)}
            >
              ❌
            </button>
          )}
        </div>

        <div className="d-flex justify-content-between mt-2">
          {user && canReply && (
            <button
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={() => setReplyTo(comment.id)}
            >
              ↪ Reply
            </button>
          )}

          {comment.replies?.length > 0 && (
            <button
              className="btn btn-sm btn-link text-primary"
              onClick={() => toggleCollapse(comment.id)}
            >
              {isCollapsed ? "▶ Show Replies" : "▼ Hide Replies"}
            </button>
          )}
        </div>

        <div
          className={`collapse-replies ${isCollapsed ? "collapsed" : "expanded"}`}
          style={{ overflow: "hidden", transition: "max-height 0.3s ease" }}
        >
          {!isCollapsed && comment.replies?.map((reply) => renderComment(reply, depth + 1))}
        </div>
      </div>
    );
  };

  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;
  if (!post) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow mb-4">
        <div className="card-body">
          <h3>{post.title}</h3>
          <div className="d-flex flex-column align-items-center gap-1 mb-3">
            <button
              className={`btn btn-sm ${userVote === "up" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => handleVote("up")}
              disabled={!user}
            >
              👍
            </button>
            <span className="fw-bold">{votes}</span>
            <button
              className={`btn btn-sm ${userVote === "down" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => handleVote("down")}
              disabled={!user}
            >
              👎
            </button>
          </div>
          {post.content && <p>{post.content}</p>}
          {post.link && (
            <p>
              Link: <a href={post.link}>{post.link}</a>
            </p>
          )}
          <small className="text-muted">Posted by {post.author?.name}</small>
        </div>
      </div>

      <div className="card shadow mb-4">
        <div className="card-body">
          <h5 className="mb-3">Comments ({comments.length})</h5>

          <div className="mb-3 d-flex justify-content-end">
            <select
              className="form-select form-select-sm w-auto"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {nestComments(comments).map((c) => renderComment(c))}

          <hr />
          {replyTo && (
            <div className="alert alert-info py-2 px-3">
              Replying to comment #{replyTo}{" "}
              <button
                className="btn btn-sm btn-link text-danger"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </button>
            </div>
          )}

          {user ? (
            <form onSubmit={handleCommentSubmit}>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
              <button className="btn btn-primary">Submit Comment</button>
            </form>
          ) : (
            <p className="text-muted">Login to comment.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
