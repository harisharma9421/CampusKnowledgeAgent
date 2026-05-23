import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Logo from '../ui/Logo.jsx';

/**
 * Navbar — Top navigation bar
 * Contains: hamburger menu (mobile), logo, page title, and action buttons.
 */
const Navbar = () => {
  const { toggleSidebar, theme, toggleTheme } = useApp();
  const { user, logout } = useAuth();

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-surface-200 shadow-xs lg:px-6">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="btn-ghost p-2 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <HamburgerIcon />
        </button>

        {/* Logo — visible on mobile only (desktop shows in sidebar) */}
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>
      </div>

      {/* Center: Page context (placeholder) */}
      <div className="hidden md:flex items-center gap-2 text-sm text-surface-500">
        <span className="font-medium text-surface-700">Campus Knowledge Agent</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2 rounded-lg"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* Notification bell (placeholder) */}
        <Link to="/notifications" className="btn-ghost p-2 rounded-lg relative" aria-label="Notifications">
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-surface-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium text-surface-700 max-w-[120px] truncate">
              {user?.displayName || 'User'}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="btn-ghost text-xs hidden md:inline-flex"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

// ── Inline SVG Icons ──────────────────────────────────────────────────────────

const HamburgerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export default Navbar;
