import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">Office Chores</div>
      <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        Calendar
      </NavLink>
      <NavLink to="/chores" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        Chores
      </NavLink>
      <NavLink to="/members" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        Members
      </NavLink>
    </nav>
  );
}
