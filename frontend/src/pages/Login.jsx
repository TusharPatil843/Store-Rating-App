import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import API from '../services/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'storeOwner') navigate('/owner');
      else navigate('/user');
    } catch (err) {
      setToastMessage(err.response?.data?.msg || 'Login failed');
      setShowToast(true);

      // Hide toast after 3s
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  return (
    <div className="container mt-5">
      {/* Toast */}
      {showToast && (
        <div
          className="toast-container position-fixed top-0 end-0 p-3"
          style={{ zIndex: 9999 }}
        >
          <div className="toast align-items-center text-white bg-danger border-0 show">
            <div className="d-flex">
              <div className="toast-body">
                {toastMessage}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setShowToast(false)}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Login Form */}
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h2 className="text-center mb-4">Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
            <p className="mt-3 text-center">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
