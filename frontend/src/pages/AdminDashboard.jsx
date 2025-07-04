import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (!data.is_admin) {
          navigate("/", { replace: true });
        } else {
          setUser(data);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      });
  }, [navigate, token]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      axios.get("http://localhost:5000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([analyticsRes, usersRes]) => {
        setAnalytics(analyticsRes.data);
        setUsers(usersRes.data);
      })
      .catch((err) => console.error("Failed loading admin data", err))
      .finally(() => setLoading(false));
  }, [user, token]);

  const toggleBan = async (userId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/ban`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { data } = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
    } catch {
      alert("Failed to toggle ban");
    }
  };

  if (loading) {
    return <div className="container mt-5">Loading Admin Panel…</div>;
  }

  const totalPages = Math.ceil(users.length / perPage);
  const start = (page - 1) * perPage;
  const pagedUsers = users.slice(start, start + perPage);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Admin Dashboard</h2>

      <div className="mb-4 p-3 bg-light border rounded">
        <h5>Analytics</h5>
        <ul>
          <li>Total Users: {analytics.total_users}</li>
          <li>Banned Users: {analytics.banned_users}</li>
          <li>Admins: {analytics.active_admins}</li>
          <li>Total Posts: {analytics.total_posts}</li>
          <li>Total Comments: {analytics.total_comments}</li>
          {analytics.top_post && (
            <li>
              Top Post: <strong>{analytics.top_post.title}</strong> &ndash;{" "}
              {analytics.top_post.upvotes} upvotes, {analytics.top_post.comments} comments
            </li>
          )}
        </ul>
      </div>

      <div className="p-3 bg-white border rounded">
        <h5>Users</h5>
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Banned</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.is_admin ? "✔" : ""}</td>
                <td>{u.is_banned ? "🚫" : "✅"}</td>
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

        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i + 1} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
