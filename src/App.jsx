import { useTheme } from './hooks/useTheme';
import Dashboard from './components/Dashboard/Dashboard';
import './styles/global.css';

function App() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="page-wrapper">
      <Dashboard theme={theme} toggleTheme={toggleTheme} isDark={isDark} />
    </div>
  );
}

export default App;