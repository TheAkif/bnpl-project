import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, login as doLogin, saveAuth } from '../api/auth';
import "../index.css";

export default function Signup() {
  const [form, setForm] = useState({
    username:'', email:'', role:'customer',
    first_name:'', last_name:'', password:''
  });
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleChange = e => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await signup(form);
      const data = await doLogin(form.username, form.password);
      saveAuth(data);
      nav(data.user.role==='merchant'?'/merchant':'/user');
    } catch {
      setError('Signup failed');
    }
  };

  return (
    <div className="container">
      <h2>Sign Up</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="first_name">First Name</label>
        <input
          id="first_name"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="last_name">Last Name</label>
        <input
          id="last_name"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="role">Role</label>
        <select id="role" name="role" value={form.role} onChange={handleChange}>
          <option value="customer">Customer</option>
          <option value="merchant">Merchant</option>
        </select>

        <button type="submit">Sign Up</button>
      </form>
      <p className="link">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
