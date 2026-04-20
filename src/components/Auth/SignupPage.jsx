import { useState } from 'react';
import { motion } from 'framer-motion';
import './Auth.css';

function SignupPage({ onSignup, onGoLogin }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    // Check if email already exists
    const storedAccounts = JSON.parse(localStorage.getItem('sbp_accounts') || '[]');
    const exists = storedAccounts.find(
      acc => acc.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (exists) {
      setError('An account with that email already exists. Please log in.');
      return;
    }

    // Save new account
    const newAccount = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      createdAt: new Date().toISOString()
    };

    storedAccounts.push(newAccount);
    localStorage.setItem('sbp_accounts', JSON.stringify(storedAccounts));

    // Log them in straight away
    onSignup(newAccount.name);
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
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start managing your budget today</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Amarachi Iroha"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
            />
          </div>
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
              placeholder="At least 6 characters"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
            />
          </div>
          <div className="auth-field">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn-primary">
            Sign Up
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button className="auth-link" onClick={onGoLogin}>
            Log In
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default SignupPage;