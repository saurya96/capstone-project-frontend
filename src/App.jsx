import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import SkipLink from '@components/common/SkipLink';
import AppRoutes from './routes';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Create live region for announcements if it doesn't exist
    if (!document.getElementById('a11y-announcer')) {
      const announcer = document.createElement('div');
      announcer.id = 'a11y-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
