import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data.");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-3">Welcome, {user.name}!</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.is_admin ? "Admin" : "User"}</p>
          <p><strong>Total Posts:</strong> {user.posts?.length || 0}</p>
          <p><strong>Total Comments:</strong> {user.comments?.length || 0}</p>

          <hr />

          <h4 className="mt-4 mb-3">Your Posts</h4>
            {user.posts?.length > 0 ? (
            user.posts.map((post) => (
                <PostCard
                key={post.id}
                post={post}
                showControls={true}
                onDelete={(deletedId) =>
                    setUser((prev) => ({
                    ...prev,
                    posts: prev.posts.filter((p) => p.id !== deletedId),
                    }))
                }
                />
            ))
            ) : (
            <p>You haven't posted anything yet.</p>
            )}


          <div className="d-flex flex-column gap-2" style={{ maxWidth: "300px" }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/new-post")}
            >
              + Create New Post
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/update-profile")}
            >
              Edit Profile
            </button>
            <button
              className="btn btn-outline-warning"
              onClick={() => navigate("/change-password")}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
