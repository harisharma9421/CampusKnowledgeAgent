import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar.jsx';
import Sidebar from '../components/navigation/Sidebar.jsx';
import { useApp } from '../contexts/AppContext.jsx';

/**
 * MainLayout — Primary application shell
 * Renders the persistent Navbar and Sidebar alongside page content.
 * The <Outlet /> renders the matched child route component.
 */
const MainLayout = () => {
  const { sidebarOpen, closeSidebar } = useApp();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden animate-fade-in"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <div className="page-container py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
