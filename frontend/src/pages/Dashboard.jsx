import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import PostCard from "../components/PostCard";
import NewPostModal from "../components/NewPostModal";
import EditProfileModal from "../components/EditProfileModal";
import ChangePasswordModal from "../components/ChangePasswordModal";

export default function Dashboard() {
  const [user, setUser]                   = useState(null);
  const [error, setError]                 = useState("");
  const [showNewPost, setShowNewPost]     = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const navigate                          = useNavigate();

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    try {
      const { data } = await axiosInstance.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user data.");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-maroon" role="status" />
      </div>
    );
  }

  const handleDelete = (deletedId) => {
    setUser((u) => ({
      ...u,
      posts: u.posts.filter((p) => p.id !== deletedId),
    }));
  };

  return (
    <div className="container my-5">
      <div className="card bg-dark text-light shadow mb-4">
        <div className="card-body">
          <h2 className="mb-3">Welcome, {user.name}!</h2>

          <div className="row mb-3">
            <div className="col-md-6">
              <p><strong>Email:</strong> {user.email}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Role:</strong> {user.is_admin ? "Admin" : "User"}</p>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <p><strong>Total Posts:</strong> {user.posts?.length || 0}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Total Comments:</strong> {user.comment_count || 0}</p>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-maroon"
              onClick={() => setShowNewPost(true)}
            >
              + New Post
            </button>
            <button
              className="btn btn-maroon"
              onClick={() => setShowEditProfile(true)}
            >
              Edit Profile
            </button>
            <button
              className="btn btn-maroon"
              onClick={() => setShowChangePwd(true)}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-light mb-3">Your Posts</h4>
        {user.posts?.length > 0 ? (
          <div className="row gy-3">
            {user.posts.map((post) => (
              <div key={post.id} className="col-12">
                <PostCard
                  post={post}
                  showControls={true}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-light">You haven’t posted anything yet.</p>
        )}
      </div>

      <NewPostModal
        show={showNewPost}
        onClose={() => setShowNewPost(false)}
        onCreated={async () => {
          setShowNewPost(false);
          await fetchUser();
        }}
      />

      <EditProfileModal
        show={showEditProfile}
        user={user}
        onClose={() => setShowEditProfile(false)}
        onUpdated={(updated) => {
          setShowEditProfile(false);
          setUser((u) => ({ ...u, ...updated }));
        }}
      />

      <ChangePasswordModal
        show={showChangePwd}
        onClose={() => setShowChangePwd(false)}
      />
    </div>
  );
}