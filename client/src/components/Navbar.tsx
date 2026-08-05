import { Link } from "react-router-dom";
import { useAuth } from "../context/auth-context";

export default function Navbar() {
  const { user, logout } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "agent";
  const isAdmin = user?.role === "admin";

  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      <div className="flex-1 items-center gap-6">
        <Link to="/" className="text-lg font-semibold">
          Ticket Desk
        </Link>
        <div className="flex gap-4 text-sm">
          <Link to="/" className="link link-hover">
            Tickets
          </Link>
          {isStaff && (
            <Link to="/board" className="link link-hover">
              Board
            </Link>
          )}
          {isAdmin && (
            <Link to="/users" className="link link-hover">
              Users
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-base-content/70">
            {user.first_name} {user.last_name} · {user.role}
          </span>
        )}
        <button className="btn btn-sm btn-ghost" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}
