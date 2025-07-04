import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import PostCard from "../components/PostCard";
import NewPostModal from "../components/NewPostModal";

export default function Home() {
  const [posts, setPosts]             = useState([]);
  const [user, setUser]               = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [search, setSearch]           = useState("");
  const [sortBy, setSortBy]           = useState("upvotes"); // default to upvotes
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

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase())
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === "upvotes") {
      return b.upvotes - a.upvotes;
    } else if (sortBy === "comments") {
      return (b.comments?.length || 0) - (a.comments?.length || 0);
    }
    return 0;
  });

  return (
    <div className="home-container">
      <header className="home-header mb-3">
        <h1 className="home-title">Community Pulse</h1>
      </header>

      {/* Top Controls Row */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
        {/* New Post Button - left */}
        {user && (
          <button
            className="btn btn-maroon btn-sm"
            onClick={() => setShowNewPost(true)}
          >
            + New Post
          </button>
        )}

        {/* Search Input - center */}
        <input
          type="text"
          className="form-control bg-dark text-white border-secondary"
          placeholder="Search by title or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "300px" }}
        />

        {/* Sort Dropdown - right */}
        <select
          className="form-select bg-dark text-white border-secondary"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="recent">Most Recent</option>
          <option value="upvotes">Most Upvoted</option>
          <option value="comments">Most Commented</option>
        </select>
      </div>

      {/* Posts Feed */}
      <div className="posts-feed">
        {sortedPosts.length === 0 ? (
          <p className="text-center text-muted">No posts found.</p>
        ) : (
          sortedPosts.map((post, idx) => (
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
