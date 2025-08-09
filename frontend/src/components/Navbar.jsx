import { useAuth } from '../context/authContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container d-flex justify-content-between">
        <span className="navbar-text me-auto">
          Welcome, <strong>{user.name}</strong> ({user.role})
        </span>

        <div className="d-flex align-items-center gap-3">
          <Link to="/update-password" className="btn btn-outline-light btn-sm">
            Change Password
          </Link>
          <button onClick={logout} className="btn btn-danger btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
