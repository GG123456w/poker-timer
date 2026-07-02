import React, { useEffect, useState } from 'react';
import { TimerProvider } from './contexts/TimerContext';
import TimerPage from './pages/TimerPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import { isLoggedIn } from './utils/auth';

const App: React.FC = () => {
  const [route, setRoute] = useState<string>(() => window.location.hash.replace('#', '') || '/');

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace('#', '') || '/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // 路由守卫：访问 /admin 必须登录
  if (route === '/admin' && !isLoggedIn()) {
    return <LoginPage />;
  }

  return (
    <TimerProvider>
      {route === '/admin' ? <AdminPage /> : <TimerPage />}
    </TimerProvider>
  );
};

export default App;
