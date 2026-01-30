import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleAddServiceClick = () => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/add-service/details');
    } else if (user?.role !== 'vendor') {
      alert('Only vendors can add services. Please contact us to become a vendor.');
    } else {
      navigate('/add-service/details');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <span className="navbar-logo">🔌</span>
            <span className="navbar-title">Plugdin</span>
          </Link>
        </div>

        <div className="navbar-center">
          <button className="navbar-link" onClick={handleAddServiceClick}>
            Add New Service
          </button>
          <Link to="/apply-as-vendor" className="navbar-link">
            Apply as a Vendor
          </Link>
          <Link to="/brand-home" className="navbar-link">
            Brand Home
          </Link>
          <Link to="/creator-vendor-onboarding" className="navbar-link">
            Creator Vendor Onboarding
          </Link>
        </div>

        <div className="navbar-right">
          {isAuthenticated && user ? (
            <div className="navbar-user">
              <span className="navbar-user-name">
                {user.firstName} {user.lastName}
              </span>
              <span className="navbar-user-role">({user.role})</span>
              <Link to="/profile/settings" className="navbar-link navbar-link-right">
                Profile Settings
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary navbar-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/auth" className="btn btn-secondary navbar-btn">
                Log in
              </Link>
              <Link to="/auth" className="btn btn-primary navbar-btn">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
