import { useState } from 'react';
import { motion } from 'framer-motion';
import './Auth.css';

function LoginPage({ onLogin, onGoSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    const name = email.split('@')[0];
    onLogin(name);
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-logo">💰</div>
        <h1 className="auth-title">Welcome Back!</h1>
        <p className="auth-subtitle">Sign in to your budget planner</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <p className="auth-forgot">Forgot Password?</p>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn-primary">
            Log In
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button className="auth-link" onClick={onGoSignup}>
            Sign Up
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;