import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/search', label: 'Find Doctors', icon: '🔍' },
    { path: '/book', label: 'Book Appointment', icon: '📅' },
    { path: '/appointments', label: 'My Appointments', icon: '📋' },
    { path: '/records', label: 'Medical Records', icon: '📄' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
