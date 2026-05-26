import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// This is the sidebar + page wrapper
// Every page uses this so they all have the same sidebar
const Layout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const handleLogout = () => {
    // Remove saved login info
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    toast.success("Logged out!");
    navigate("/"); // Go back to login
  };

  return (
    <div className="app-layout">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-title">
          🧾 <span>Billing</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard"     className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            🏠 Dashboard
          </NavLink>
          <NavLink to="/create-bills"  className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            🧾 Create Bill
          </NavLink>
          <NavLink to="/view-products" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            📦 Products
          </NavLink>
          <NavLink to="/add-product"   className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            ➕ Add Product
          </NavLink>
        </nav>

        {/* User info and logout at bottom */}
        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="user-avatar">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{username}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content">
        <div className="page-header">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="page-body">
          {children}
        </div>
      </div>

    </div>
  );
};

export default Layout;