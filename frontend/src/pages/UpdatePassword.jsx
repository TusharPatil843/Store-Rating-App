import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/authContext';

const UpdatePassword = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'danger' });

  const showToast = (message, type = 'danger') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return showToast('New passwords do not match');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(form.newPassword)) {
      return showToast('New password must be 8–16 chars, 1 uppercase, 1 special char');
    }

    try {
      await API.put('/auth/update-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      showToast('Password updated successfully!', 'success');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

      setTimeout(() => {
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'storeOwner') navigate('/owner');
        else navigate('/user');
      }, 1200);
    } catch (err) {
      showToast(err.response?.data?.msg || 'Failed to update password');
    }
  };

  return (
    <div className="container mt-4">
      <Navbar />

      {/* Toast */}
      {toast.show && (
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show text-white bg-${toast.type} border-0`}>
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast({ show: false, message: '', type: '' })}></button>
            </div>
          </div>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4 text-center">Update Password</h2>
          <form onSubmit={handleSubmit} className="border p-4 rounded bg-light shadow-sm">
            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
