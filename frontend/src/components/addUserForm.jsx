import { useState } from 'react';
import API from '../services/api';

const AddUserForm = ({ onUserAdded }) => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', address: '', role: 'user'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validations here (basic)
    if (form.name.length < 20 || form.name.length > 60) {
      return alert('Name must be 20–60 characters');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(form.password)) {
      return alert('Password must be 8–16 characters with 1 uppercase and 1 special char');
    }

    try {
      await API.post('/auth/register', form);
      alert('User added successfully!');
      setForm({ name: '', email: '', password: '', address: '', role: 'user' });
      onUserAdded(); // trigger refetch in AdminDashboard
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to add user');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add New User</h3>
      <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
      <input placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
      <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
        <option value="user">Normal User</option>
        <option value="storeOwner">Store Owner</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Add User</button>
    </form>
  );
};

export default AddUserForm;
