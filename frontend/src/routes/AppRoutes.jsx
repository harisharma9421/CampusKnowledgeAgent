import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ChatPage from '../pages/ChatPage.jsx';
import AcademicResourcePage from '../pages/AcademicResourcePage.jsx';
import FacultyPage from '../pages/FacultyPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotificationsPage from '../pages/NotificationsPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

/**
 * AppRoutes — Central route configuration
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/timetable" element={<AcademicResourcePage type="timetable" />} />
        <Route path="/notices" element={<AcademicResourcePage type="notices" />} />
        <Route path="/events" element={<AcademicResourcePage type="events" />} />
        <Route path="/faculty" element={<FacultyPage />} />
        <Route path="/faq" element={<AcademicResourcePage type="faq" />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
