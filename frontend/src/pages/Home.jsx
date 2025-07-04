import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import NewPostModal from "../components/NewPostModal";

export default function Home() {
  const [posts, setPosts]             = useState([]);
  const [user, setUser]               = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/posts")
      .then((res) => setPosts(res.data))
      .catch(() => alert("Failed to load posts"));

    if (token) {
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
    }
  }, [token]);

  const refreshPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts");
      setPosts(res.data);
    } catch {
      alert("Could not refresh posts");
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h2 className="home-title">Community Pulse</h2>
        {user && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewPost(true)}
          >
            + New Post
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="no-posts">No posts yet.</p>
      ) : (
        <div className="posts-list">
          {posts.map((post, idx) => (
            <div
              key={post.id}
              className="post-wrapper"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <PostCard post={post} showControls={false} />
            </div>
          ))}
        </div>
      )}

      <NewPostModal
        show={showNewPost}
        onClose={() => setShowNewPost(false)}
        onCreated={async () => {
          setShowNewPost(false);
          await refreshPosts();
        }}
      />
    </div>
  );
}
