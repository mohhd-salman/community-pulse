import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [isAdmin, setIsAdmin] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/is-admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.is_admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          navigate("/"); // redirect non-admins
        }
      } catch (err) {
        console.error("Admin check failed");
        navigate("/");
      }
    };

    checkAdmin();
  }, [navigate, token]);

  // Load analytics + users once admin is confirmed
  useEffect(() => {
    if (isAdmin !== true) return;

    const fetchAnalyticsAndUsers = async () => {
      try {
        const [analyticsRes, usersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/analytics", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setAnalytics(analyticsRes.data);
        setUsers(usersRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load admin data");
      }
    };

    fetchAnalyticsAndUsers();
  }, [isAdmin, token]);

  const toggleBan = async (userId) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/users/${userId}/ban`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // refresh users
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      alert("Failed to toggle ban");
    }
  };

  if (loading || isAdmin === null) return <div className="container mt-5">Loading Admin Panel...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Admin Dashboard</h2>

      <div className="mb-4 p-3 bg-light border rounded">
        <h5>📊 Analytics</h5>
        <ul>
          <li>Total Users: {analytics.total_users}</li>
          <li>Banned Users: {analytics.banned_users}</li>
          <li>Admins: {analytics.active_admins}</li>
          <li>Total Posts: {analytics.total_posts}</li>
          <li>Total Comments: {analytics.total_comments}</li>
          {analytics.top_post && (
            <li>
              🔝 Top Post: <strong>{analytics.top_post.title}</strong> with {analytics.top_post.upvotes} upvotes & {analytics.top_post.comments} comments
            </li>
          )}
        </ul>
      </div>

      <div className="p-3 bg-white border rounded">
        <h5>👥 Users</h5>
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Banned</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.is_admin ? "✔" : ""}</td>
                <td>{u.is_banned ? "🚫" : ""}</td>
                <td>{new Date(u.created_at).toLocaleString()}</td>
                <td>
                  {!u.is_admin && (
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => toggleBan(u.id)}
                    >
                      {u.is_banned ? "Unban" : "Ban"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
