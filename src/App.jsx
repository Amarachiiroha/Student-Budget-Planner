import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import Dashboard from './components/Dashboard/Dashboard';
import BottomNav from './components/BottomNav/BottomNav';
import './styles/global.css';

function App() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="page-wrapper">
      <Dashboard
        theme={theme}
        toggleTheme={toggleTheme}
        isDark={isDark}
        activePage={activePage}
      />
      <BottomNav activePage={activePage} onNavigate={setActivePage} />
    </div>
  );
}

export default App;