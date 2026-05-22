import AppRoutes from './routes/AppRoutes.jsx';
import { AppProvider } from './contexts/AppContext.jsx';

/**
 * Root Application Component
 * Wraps the entire app in global context providers and renders the route tree.
 */
function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
