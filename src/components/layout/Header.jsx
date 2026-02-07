import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/dashboard" className="logo">
          <span className="logo-icon">🏥</span>
          <span className="logo-text">Healthcare Portal</span>
        </Link>

        <div className="header-right">
          <div className="user-menu">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
