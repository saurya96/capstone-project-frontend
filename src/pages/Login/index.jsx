import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  const fillDemoCredentials = () => {
    setEmail('demo@healthcare.com');
    setPassword('Demo123!');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏥 Healthcare Portal</h1>
          <p>Appointment & Records Management</p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="login-form"
          aria-label="Login form"
          noValidate
        >
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
              placeholder="your.email@example.com"
              required
              disabled={loading}
              aria-label="Email address"
              aria-required="true"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              aria-label="Password"
              aria-required="true"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div 
              className="error-message" 
              role="alert" 
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <button onClick={fillDemoCredentials} className="demo-link" type="button">
            Use Demo Credentials
          </button>
          <p className="demo-info">
            Demo: demo@healthcare.com / Demo123!
          </p>
          <p className="register-prompt">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
