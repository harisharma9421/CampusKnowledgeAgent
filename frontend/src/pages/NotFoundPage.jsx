import { Link } from 'react-router-dom';

/**
 * NotFoundPage — 404 error page
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 px-6 text-center">
      <div className="text-8xl mb-6">🎓</div>
      <h1 className="text-6xl font-extrabold text-surface-900 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-surface-700 mb-4">Page Not Found</h2>
      <p className="text-surface-500 max-w-md mb-8">
        The page you are looking for does not exist or has been moved. Let&apos;s get you back on track.
      </p>
      <div className="flex gap-4">
        <Link to="/" className="btn-primary px-6 py-2.5 rounded-lg">
          Go Home
        </Link>
        <Link to="/dashboard" className="btn-secondary px-6 py-2.5 rounded-lg">
          Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
