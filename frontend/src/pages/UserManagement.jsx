import { useEffect, useState } from "react";
import axios from "axios";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/check", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.is_admin) {
        setIsAdmin(true);
        fetchUsers(); // Only fetch users if admin
      }
    } catch (err) {
      console.error("Admin check failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const toggleBan = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/users/${id}/ban`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to ban/unban user", err);
    }
  };

  if (loading) return <div className="container mt-4">Checking admin access...</div>;
  if (!isAdmin) return <div className="container mt-4">Access Denied: Admins only</div>;

  return (
    <div className="container mt-4">
      <h3 className="mb-4">User Management</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Created At</th>
            <th>Admin</th>
            <th>Banned</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{new Date(u.created_at).toLocaleString()}</td>
              <td>{u.is_admin ? "✅" : "❌"}</td>
              <td>{u.is_banned ? "🚫" : "✅"}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => toggleBan(u.id)}
                  disabled={u.is_admin}
                >
                  {u.is_banned ? "Unban" : "Ban"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
