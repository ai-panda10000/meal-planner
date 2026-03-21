// Bottom navigation bar with 4 tabs
// Shows at the bottom of every page for switching between views
import { NavLink } from 'react-router-dom';
import './BottomNav.css';

// Navigation items - each tab represents a different calendar view
const navItems = [
  { path: '/', icon: '📋', label: 'Daily' },
  { path: '/weekly', icon: '📅', label: 'Weekly' },
  { path: '/monthly', icon: '🗓️', label: 'Monthly' },
  { path: '/yearly', icon: '📊', label: 'Yearly' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
          end={item.path === '/'}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
