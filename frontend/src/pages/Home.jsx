import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import PostCard from "../components/PostCard";
import NewPostModal from "../components/NewPostModal";

export default function Home() {
  const [posts, setPosts]             = useState([]);
  const [user, setUser]               = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPosts();
    if (token) {
      axiosInstance
        .get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
    }
  }, [token]);

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get("/api/posts?sort=top");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to load posts", err);
    }
  };

  const refreshPosts = async () => {
    await fetchPosts();
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Community Pulse</h1>
        {user && (
          <button
            className="btn btn-maroon btn-sm"
            onClick={() => setShowNewPost(true)}
          >
            + New Post
          </button>
        )}
      </header>

      <div className="posts-feed">
        {posts.length === 0 ? (
          <p className="text-center text-muted">No posts yet.</p>
        ) : (
          posts.map((post, idx) => (
            <div
              key={post.id}
              className="post-item"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <PostCard post={post} showControls={false} />
            </div>
          ))
        )}
      </div>

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
