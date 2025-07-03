import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/posts")
      .then((res) => setPosts(res.data))
      .catch(() => alert("Failed to load posts"));
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} showControls={false} />)
      )}
    </div>
  );
}

export default Home;
