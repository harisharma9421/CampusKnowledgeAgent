import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

/**
 * AppRoutes — Central route configuration
 * Defines the full route tree for the application.
 * Protected routes will be added in Phase 3 (auth).
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes — no layout wrapper */}
      <Route path="/" element={<LandingPage />} />

      {/* App routes — wrapped in MainLayout (navbar + sidebar) */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Future routes — uncomment as phases are implemented */}
        {/* <Route path="/chat" element={<ChatPage />} /> */}
        {/* <Route path="/timetable" element={<TimetablePage />} /> */}
        {/* <Route path="/notices" element={<NoticesPage />} /> */}
        {/* <Route path="/events" element={<EventsPage />} /> */}
        {/* <Route path="/faculty" element={<FacultyPage />} /> */}
        {/* <Route path="/profile" element={<ProfilePage />} /> */}
      </Route>

      {/* Redirect /home to / */}
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
