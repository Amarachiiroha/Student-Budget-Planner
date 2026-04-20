import { useState, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import Dashboard from './components/Dashboard/Dashboard';
import BottomNav from './components/BottomNav/BottomNav';
import './styles/global.css';

function App() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [screen, setScreen]     = useState('login');
  const [activePage, setActivePage] = useState('dashboard');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if user is already logged in from a previous session
    const saved = localStorage.getItem('sbp_logged_in_user');
    if (saved) {
      setUserName(saved);
      setScreen('app');
    }
  }, []);

  const handleLogin = (name) => {
    localStorage.setItem('sbp_logged_in_user', name);
    setUserName(name);
    setScreen('app');
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('sbp_logged_in_user');
    setUserName('');
    setScreen('login');
  };

  if (screen === 'login') {
    return <LoginPage onLogin={handleLogin} onGoSignup={() => setScreen('signup')} />;
  }

  if (screen === 'signup') {
    return <SignupPage onSignup={handleLogin} onGoLogin={() => setScreen('login')} />;
  }

  return (
    <div className="page-wrapper">
      <Dashboard
        theme={theme}
        toggleTheme={toggleTheme}
        isDark={isDark}
        activePage={activePage}
        userName={userName}
        onLogout={handleLogout}
        onNavigate={setActivePage}
      />
      <BottomNav activePage={activePage} onNavigate={setActivePage} />
    </div>
  );
}

export default App;