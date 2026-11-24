import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleLabels = {
  admin: "Administrator",
  field_officer: "Field officer",
  researcher: "Researcher",
  public_user: "Community member",
};

function Shell({ children, active = "overview" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/dashboard"><span className="brand-mark">W</span><span>WildTrace</span></Link>
        <p className="eyebrow">Conservation operations</p>
        <nav className="nav-list">
          <Link className={active === "overview" ? "nav-link active" : "nav-link"} to="/dashboard">Overview</Link>
          {user?.role === "admin" ? <>
            <Link className={active === "species" ? "nav-link active" : "nav-link"} to="/species-management">Species</Link>
            <Link className={active === "habitats" ? "nav-link active" : "nav-link"} to="/habitat-management">Habitats</Link>
            <Link className={active === "projects" ? "nav-link active" : "nav-link"} to="/project-management">Projects</Link>
            <Link className={active === "analytics" ? "nav-link active" : "nav-link"} to="/analytics">Analytics</Link>
            <Link className={active === "approvals" ? "nav-link active" : "nav-link"} to="/sighting-approvals">Sighting approvals</Link>
            <Link className={active === "incident-approvals" ? "nav-link active" : "nav-link"} to="/incident-approvals">Incident approvals</Link>
            <Link className={active === "research-approvals" ? "nav-link active" : "nav-link"} to="/research-approvals">Research approvals</Link>
            <Link className={active === "officers" ? "nav-link active" : "nav-link"} to="/field-officers">Field officers</Link>
            <Link className={active === "researchers" ? "nav-link active" : "nav-link"} to="/researchers">Researchers</Link>
          </> : user?.role === "field_officer" ? <>
            <Link className={active === "field-work" ? "nav-link active" : "nav-link"} to="/field-work">Assigned projects</Link>
            <Link className={active === "report" ? "nav-link active" : "nav-link"} to="/report">Report activity</Link>
          </> : <Link className={active === "report" ? "nav-link active" : "nav-link"} to="/report">Report activity</Link>}
          {user?.role === "researcher" && <><Link className={active === "research" ? "nav-link active" : "nav-link"} to="/research">Research log</Link></>}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip"><span className="avatar">{user?.name?.charAt(0)?.toUpperCase()}</span><span><strong>{user?.name}</strong><small>{roleLabels[user?.role]}</small></span></div>
          <button className="button button-quiet" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Shell;