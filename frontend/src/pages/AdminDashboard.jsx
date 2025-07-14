import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser]           = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);

  const [page, setPage]   = useState(1);
  const perPage           = 10;
  const totalPages        = Math.ceil(users.length / perPage);
  const startIndex        = (page - 1) * perPage;
  const pagedUsers        = users.slice(startIndex, startIndex + perPage);

  useEffect(() => {
    if (!token) return navigate("/login", { replace: true });
    axiosInstance
      .get("/api/auth/me", {
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
      axiosInstance.get("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axiosInstance.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([ aRes, uRes ]) => {
        setAnalytics(aRes.data);
        setUsers(uRes.data);
      })
      .catch((err) => console.error("Failed loading admin data", err))
      .finally(() => setLoading(false));
  }, [user, token]);

  const toggleBan = async (userId) => {
    try {
      await axiosInstance.patch(
        `/api/admin/users/${userId}/ban`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { data } = await axiosInstance.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
      if ((page - 1) * perPage >= data.length && page > 1) {
        setPage(page - 1);
      }
    } catch {
      alert("Failed to toggle ban");
    }
  };

  const toggleAdmin = async (userId, isCurrentlyAdmin) => {
    try {
      await axiosInstance.patch(
        `/api/admin/users/${userId}/set-admin`,
        { is_admin: !isCurrentlyAdmin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { data } = await axiosInstance.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
    } catch {
      alert("Failed to toggle admin role");
    }
  };

  if (loading) {
    return <div className="container mt-5 text-light">Loading Admin Panel…</div>;
  }

  return (
    <div className="container admin-dashboard mt-5 text-light">
      <h2 className="mb-4">Admin Dashboard</h2>

      <div className="mb-4 p-4 bg-secondary rounded shadow-sm text-white">
        <h5>Analytics</h5>
        <ul className="mb-0">
          <li>Total Users: {analytics.total_users}</li>
          <li>Banned Users: {analytics.banned_users}</li>
          <li>Admins: {analytics.active_admins}</li>
          <li>Total Posts: {analytics.total_posts}</li>
          <li>Total Comments: {analytics.total_comments}</li>
          {analytics.top_post && (
            <li>
              Top Post: <strong>{analytics.top_post.title}</strong> –{" "}
              {analytics.top_post.upvotes} upvotes, {analytics.top_post.comments} comments
            </li>
          )}
        </ul>
      </div>

      <div className="p-4 bg-dark rounded shadow-sm">
        <h5 className="mb-3 text-white">Users</h5>
        <table className="table table-dark table-striped table-hover mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
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
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.is_admin ? "✔️" : "—"}</td>
                <td>{u.is_banned ? "🚫" : "✅"}</td>
                <td>{new Date(u.created_at).toLocaleString()}</td>
                <td>
                  {!u.is_admin && (
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => toggleBan(u.id)}
                    >
                      {u.is_banned ? "Unban" : "Ban"}
                    </button>
                  )}
                  {user.id !== u.id && (
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={() => toggleAdmin(u.id, u.is_admin)}
                    >
                      {u.is_admin ? "Revoke Admin" : "Make Admin"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <nav>
          <ul className="pagination pagination-dark justify-content-center mt-3 mb-0">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i + 1}
                className={`page-item ${page === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}