import { Link } from "react-router-dom";
import { useAuth } from "../context/auth-context";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      <div className="flex-1">
        <Link to="/" className="text-lg font-semibold">
          Ticket Desk
        </Link>
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