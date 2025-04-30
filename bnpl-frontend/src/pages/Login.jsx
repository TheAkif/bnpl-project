import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, saveAuth } from '../api/auth';
import '../index.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const nav = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      saveAuth(data);
      if (data.user.role === 'merchant') nav('/merchant');
      else nav('/user');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
      <p className="link">
        Don’t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
