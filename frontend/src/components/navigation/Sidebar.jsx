import { NavLink } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Logo from '../ui/Logo.jsx';

/**
 * Navigation item definition.
 * @typedef {Object} NavItem
 * @property {string} label
 * @property {string} to
 * @property {JSX.Element} icon
 * @property {string} [badge]
 * @property {boolean} [disabled]
 */

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: 'AI Chatbot',
    to: '/chat',
    icon: <ChatIcon />,
    badge: 'Phase 6',
    disabled: true,
  },
  {
    label: 'Timetable',
    to: '/timetable',
    icon: <CalendarIcon />,
    badge: 'Phase 5',
    disabled: true,
  },
  {
    label: 'Notices',
    to: '/notices',
    icon: <NoticeIcon />,
    badge: 'Phase 5',
    disabled: true,
  },
  {
    label: 'Events',
    to: '/events',
    icon: <EventIcon />,
    badge: 'Phase 5',
    disabled: true,
  },
  {
    label: 'Faculty',
    to: '/faculty',
    icon: <FacultyIcon />,
    badge: 'Phase 5',
    disabled: true,
  },
  {
    label: 'FAQ',
    to: '/faq',
    icon: <FaqIcon />,
    badge: 'Phase 5',
    disabled: true,
  },
];

/**
 * Sidebar — Primary navigation panel
 * Responsive: hidden on mobile (toggled via hamburger), always visible on lg+.
 */
const branchLabels = {
  computer_engineering: 'Computer Engineering',
  electronics_engineering: 'Electronics Engineering',
  civil_engineering: 'Civil Engineering',
  mechanical_engineering: 'Mechanical Engineering',
};

const Sidebar = () => {
  const { sidebarOpen, closeSidebar } = useApp();
  const { user } = useAuth();

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-white border-r border-surface-200 shadow-sidebar
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-auto lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-surface-200">
        <Logo size="md" />
        {/* Close button — mobile only */}
        <button
          onClick={closeSidebar}
          className="btn-ghost p-1.5 lg:hidden"
          aria-label="Close sidebar"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1" role="list">
          {navItems.map((item) => (
            <li key={item.to}>
              <SidebarNavItem item={item} onNavigate={closeSidebar} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-200">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-surface-50">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-surface-800 truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-surface-500 truncate capitalize">
              {user?.branch ? branchLabels[user.branch] || user.branch : user?.role || 'Member'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

/**
 * Individual sidebar navigation item.
 */
const SidebarNavItem = ({ item, onNavigate }) => {
  if (item.disabled) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-400 cursor-not-allowed select-none">
        <span className="w-5 h-5 shrink-0">{item.icon}</span>
        <span className="text-sm font-medium flex-1">{item.label}</span>
        {item.badge && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-surface-100 text-surface-400 font-medium">
            {item.badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 group
        ${
          isActive
            ? 'bg-primary-50 text-primary-700 font-semibold'
            : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
        }`
      }
    >
      <span className="w-5 h-5 shrink-0">{item.icon}</span>
      <span className="text-sm font-medium flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-xs px-1.5 py-0.5 rounded bg-primary-100 text-primary-600 font-medium">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
};

import PropTypes from 'prop-types';
SidebarNavItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    badge: PropTypes.string,
    disabled: PropTypes.bool,
  }).isRequired,
  onNavigate: PropTypes.func.isRequired,
};

// ── Inline SVG Icons ──────────────────────────────────────────────────────────

function DashboardIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function NoticeIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
function EventIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
function FacultyIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function FaqIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default Sidebar;
