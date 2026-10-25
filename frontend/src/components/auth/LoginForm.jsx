// Local login / signup panel (replaces the redirect to Auth0).
// Not secure by design: development only. The seeded dev account is
// documented in db/master_seed.sql and the README.
import React, { useState } from 'react';
import axios from 'axios';
import './LoginForm.css';

const errorMessage = (err) => err.response?.data?.error ?? 'Something went wrong. Is the API server running?';

export default function LoginForm({ onLoggedIn, onClose }) {
  const [mode, setMode] = useState('login');
  const [fields, setFields] = useState({ login: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';
  const update = (name) => (event) => setFields({ ...fields, [name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data: user } = isSignup
        ? await axios.post('/api/signup', { username: fields.username, email: fields.email, password: fields.password })
        : await axios.post('/api/login', { login: fields.login, password: fields.password });
      await onLoggedIn(user);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError('');
  }

  return (
    <div className="login-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="login-panel" onSubmit={submit}>
        <button type="button" className="login-close" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>

        <div className="login-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? 'theme-text' : ''} onClick={() => switchMode('login')}>
            Log in
          </button>
          <button type="button" role="tab" aria-selected={isSignup} className={isSignup ? 'theme-text' : ''} onClick={() => switchMode('signup')}>
            Sign up
          </button>
        </div>

        {isSignup ? (
          <>
            <label>
              <span>Username</span>
              <input className="theme-input" value={fields.username} onChange={update('username')} autoComplete="username" autoFocus required />
            </label>
            <label>
              <span>Email (optional)</span>
              <input className="theme-input" type="email" value={fields.email} onChange={update('email')} autoComplete="email" />
            </label>
          </>
        ) : (
          <label>
            <span>Username or email</span>
            <input className="theme-input" value={fields.login} onChange={update('login')} autoComplete="username" autoFocus required />
          </label>
        )}

        <label>
          <span>Password</span>
          <input
            className="theme-input"
            type="password"
            value={fields.password}
            onChange={update('password')}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
          />
        </label>

        {error ? <p className="login-error" role="alert">{error}</p> : null}

        <button type="submit" className="filled-button theme-color login-submit" disabled={busy}>
          {busy ? '...' : isSignup ? 'Create account' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
