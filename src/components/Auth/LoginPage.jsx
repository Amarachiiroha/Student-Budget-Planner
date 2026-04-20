import { useState } from 'react';
import { motion } from 'framer-motion';
import './Auth.css';

function LoginPage({ onLogin, onGoSignup }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    // Check if any account exists at all
    const storedAccounts = JSON.parse(localStorage.getItem('sbp_accounts') || '[]');

    if (storedAccounts.length === 0) {
      setError("No account found. Please sign up first.");
      return;
    }

    // Find matching account
    const account = storedAccounts.find(
      acc => acc.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!account) {
      setError("No account found with that email. Please sign up first.");
      return;
    }

    if (account.password !== password) {
      setError("Incorrect password. Please try again.");
      return;
    }

    // Login successful
    onLogin(account.name);
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
              onChange={e => { setEmail(e.target.value); setError(''); }}
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
            />
          </div>

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