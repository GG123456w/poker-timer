import React, { useEffect, useState } from 'react';
import { TimerProvider } from './contexts/TimerContext';
import TimerPage from './pages/TimerPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  const [route, setRoute] = useState<string>(() => window.location.hash.replace('#', '') || '/');

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace('#', '') || '/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <TimerProvider>
      {route === '/admin' ? <AdminPage /> : <TimerPage />}
    </TimerProvider>
  );
};

export default App;
