import AppRoutes from './routes/AppRoutes.jsx';
import { AppProvider } from './contexts/AppContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

/**
 * Root Application Component
 * Wraps the entire app in global context providers and renders the route tree.
 */
function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
