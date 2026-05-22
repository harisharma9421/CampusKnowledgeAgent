import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

/**
 * AppRoutes — Central route configuration
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
