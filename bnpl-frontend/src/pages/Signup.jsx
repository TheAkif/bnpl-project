import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, login as doLogin, saveAuth } from '../api/auth';
import '../index.css';

export default function Signup() {
  const [form, setForm] = useState({
    username: '', email: '', role: 'customer',
    first_name: '', last_name: '', password: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(form);
      const data = await doLogin(form.username, form.password);
      saveAuth(data);
      nav(data.user.role === 'merchant' ? '/merchant' : '/user');
    } catch (err) {
      const d = err.response?.data;
      const msg =
        d?.username?.[0] ??
        d?.email?.[0] ??
        d?.password?.[0] ??
        d?.detail ??
        'Signup failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Create account</h2>
      <p className="auth-subtitle">Start managing installment plans today</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-row">
          <div>
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />

        <label htmlFor="role">I am a</label>
        <select id="role" name="role" value={form.role} onChange={handleChange}>
          <option value="customer">Customer: pay in installments</option>
          <option value="merchant">Merchant: create payment plans</option>
        </select>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="auth-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
