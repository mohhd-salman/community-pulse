import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import EditPostModal from "../components/EditPostModal";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [error, setError] = useState("");
  const [showEditPost, setShowEditPost] = useState(false);

  const fetchPost = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/api/posts/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(data);
      setUserVote(data.user_vote || null);
    } catch {
      setError("Failed to load post.");
    }
  };

  const fetchVotes = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/api/posts/${postId}/votes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
    } catch {
      console.error("Could not load vote counts");
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/api/comments?post_id=${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(data);
    } catch {
      console.error("Error loading comments");
    }
  };

  const fetchUser = async () => {
    if (!token) return;
    try {
      const { data } = await axiosInstance.get(
        "/api/auth/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(data);
    } catch {
      console.error("Error loading user");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    fetchPost();
    fetchVotes();
    fetchComments();
    fetchUser();
  }, [postId, token, navigate]);

  const handleVote = async (direction) => {
    if (!user) return;
    try {
      await axiosInstance.post(
        "/api/votes",
        { post_id: postId, vote_type: direction },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserVote((prev) => (prev === direction ? null : direction));
      fetchVotes();
    } catch {
      console.error("Vote failed");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axiosInstance.post(
        "/api/comments",
        { post_id: postId, content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      fetchComments();
    } catch {
      console.error("Failed to submit comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axiosInstance.delete(
        `/api/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments();
    } catch {
      console.error("Failed to delete comment");
    }
  };

  const isOwner = user?.id === post?.author_id;
  const isAdmin = user?.is_admin;
  const handleEditPost = () => setShowEditPost(true);
  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axiosInstance.delete(
        `/api/posts/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/", { replace: true });
    } catch {
      alert("Failed to delete post");
    }
  };

  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;
  if (!post) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow mb-4">
        <div className="card-body">
          <h3>{post.title}</h3>

          <div className="mb-2 text-center">
            <span className="me-3">👍 {upvotes}</span>
            <span>👎 {downvotes}</span>
          </div>

          <div className="d-flex justify-content-center gap-2 mb-3">
            <button
              className={`btn btn-sm ${userVote === "up" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => handleVote("up")}
            >👍</button>
            <button
              className={`btn btn-sm ${userVote === "down" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => handleVote("down")}
            >👎</button>
          </div>

          {userVote && (
            <p className="text-center text-muted mb-3">
              You {userVote === "up" ? "upvoted" : "downvoted"} this
            </p>
          )}

          {post.content && <p>{post.content}</p>}
          {post.link && (
            <p>
              Link: <a href={post.link} target="_blank" rel="noopener noreferrer">{post.link}</a>
            </p>
          )}

          <small className="text-muted">
            Posted by {post.author_name} on {new Date(post.created_at).toLocaleString()}
          </small>

          {(isOwner || isAdmin) && (
            <div className="mt-3 d-flex justify-content-end gap-2">
              <button className="btn btn-sm btn-outline-primary" onClick={handleEditPost}>
                Edit
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={handleDeletePost}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card shadow mb-4">
        <div className="card-body">
          <h5 className="mb-3">Comments ({comments.length})</h5>

          {comments.map((c) => (
            <div
              key={c.id}
              className="mb-3 p-3 border rounded d-flex justify-content-between align-items-start"
            >
              <div>
                <strong>{c.author_name}</strong>
                <p className="mb-1">{c.content}</p>
                <small className="text-muted">
                  {new Date(c.created_at).toLocaleString()}
                </small>
              </div>
              {user?.id === c.author_id && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteComment(c.id)}
                >Delete</button>
              )}
            </div>
          ))}

          <hr />

          {user ? (
            <form onSubmit={handleCommentSubmit}>
              <textarea
                className="form-control mb-2 bg-secondary text-white"
                rows={3}
                placeholder="Write a comment…"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button type="submit" className="btn btn-maroon">
                Submit Comment
              </button>
            </form>
          ) : (
            <p className="text-muted">Login to comment.</p>
          )}
        </div>
      </div>

      <EditPostModal
        show={showEditPost}
        post={post}
        onClose={() => setShowEditPost(false)}
        onUpdated={(updated) => {
          setPost((p) => ({ ...p, ...updated }));
          setShowEditPost(false);
        }}
      />
    </div>
  );
}
