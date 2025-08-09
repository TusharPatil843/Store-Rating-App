import { useEffect, useState } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);

  const [userQuery, setUserQuery] = useState({ name: '', email: '', role: '' });
  const [storeQuery, setStoreQuery] = useState({ name: '', email: '', address: '' });

  const [form, setForm] = useState({
    name: '', email: '', password: '', address: '', role: 'user'
  });

  const [userSort, setUserSort] = useState({ field: '', direction: '' });
  const [storeSort, setStoreSort] = useState({ field: '', direction: '' });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchStats = async () => {
    const res = await API.get('/admin/dashboard');
    setStats(res.data);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams(userQuery);
      const res = await API.get(`/admin/users?${params.toString()}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStores = async () => {
    setLoadingStores(true);
    try {
      const params = new URLSearchParams(storeQuery);
      const res = await API.get(`/stores?${params.toString()}`);
      setStores(res.data);
    } catch (err) {
      console.error('Error fetching stores', err);
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (form.name.length < 20 || form.name.length > 60) {
      return showToast('Name must be between 20 and 60 characters.', 'danger');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(form.password)) {
      return showToast('Password must be 8–16 characters, with 1 uppercase and 1 special char.', 'danger');
    }

    try {
      const res = await API.post('/auth/register', form);
      const newUser = res.data.user;
      showToast('User added successfully!');

      if (form.role === 'storeOwner') {
        try {
          await API.post('/stores', {
            name: form.name,
            email: form.email,
            address: form.address,
            owner_id: newUser.id
          });
          showToast('Store created for the new store owner!');
          fetchStores();
        } catch (storeErr) {
          console.error('Store creation error:', storeErr);
          showToast('User created, but store creation failed.', 'danger');
        }
      }

      setForm({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      console.error('User creation error:', err);
      showToast(err.response?.data?.msg || 'Failed to add user', 'danger');
    }
  };

  const handleViewUser = async (user) => {
    let details = `
Name: ${user.name}
Email: ${user.email}
Role: ${user.role}
Address: ${user.address}
`;
    if (user.role === 'storeOwner') {
      try {
        const res = await API.get(`/stores?email=${user.email}`);
        const store = res.data[0];
        details += `Rating: ${store?.average_rating || 'Not rated yet'}`;
      } catch (err) {
        console.error('Error fetching store rating:', err);
        details += `Rating: Unable to fetch`;
      }
    }
    showToast(details, 'info');
  };

  const sortData = (data, field, direction) => {
    const sorted = [...data].sort((a, b) => {
      const valA = a[field]?.toString().toLowerCase() || '';
      const valB = b[field]?.toString().toLowerCase() || '';
      return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    return sorted;
  };

  const handleUserSort = (field, direction) => {
    setUserSort({ field, direction });
    const sorted = sortData(users, field, direction);
    setUsers(sorted);
  };

  const handleStoreSort = (field, direction) => {
    setStoreSort({ field, direction });
    const sorted = sortData(stores, field, direction);
    setStores(sorted);
  };

  return (
    <div className="container">
      <Navbar />
      
      {/* Toast Component */}
      {toast.show && (
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show text-white bg-${toast.type} border-0`}>
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast({ show: false, message: '', type: 'success' })}></button>
            </div>
          </div>
        </div>
      )}

      <h2 className="mb-4">Admin Dashboard</h2>

      {stats && (
        <div className="row mb-4">
          <div className="col-md-4"><strong>Total Users:</strong> {stats.total_users}</div>
          <div className="col-md-4"><strong>Total Stores:</strong> {stats.total_stores}</div>
          <div className="col-md-4"><strong>Total Ratings:</strong> {stats.total_ratings}</div>
        </div>
      )}

      <hr />

      {/* Add User */}
      <h3>Add New User</h3>
      <form onSubmit={handleAddUser} className="row g-3 mb-4">
        <div className="col-md-4">
          <input className="form-control" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="col-md-4">
          <input className="form-control" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="col-md-4">
          <input type="password" className="form-control" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="col-md-4">
          <input className="form-control" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="user">Normal User</option>
            <option value="storeOwner">Store Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="col-md-4">
          <button className="btn btn-primary w-100" type="submit">Add User</button>
        </div>
      </form>

      <hr />

      {/* Filter Users */}
      <h3>All Users</h3>
      <div className="row mb-3 g-2">
        <div className="col-md-3">
          <input className="form-control" placeholder="Search name" onChange={e => setUserQuery({ ...userQuery, name: e.target.value })} />
        </div>
        <div className="col-md-3">
          <input className="form-control" placeholder="Search email" onChange={e => setUserQuery({ ...userQuery, email: e.target.value })} />
        </div>
        <div className="col-md-3">
          <select className="form-select" onChange={e => setUserQuery({ ...userQuery, role: e.target.value })}>
            <option value="">All Roles</option>
            <option value="user">Normal User</option>
            <option value="storeOwner">Store Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-secondary w-100" onClick={fetchUsers}>Filter Users</button>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-responsive mb-5">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              {['name', 'email', 'role', 'address'].map(field => (
                <th key={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}{' '}
                  <span role="button" onClick={() => handleUserSort(field, 'asc')}>↑</span>&nbsp;&nbsp;&nbsp;
                  <span role="button" onClick={() => handleUserSort(field, 'desc')}>↓</span>
                </th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loadingUsers ? (
              <tr><td colSpan="5">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5">No users found.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.address}</td>
                  <td><button className="btn btn-sm btn-outline-info" onClick={() => handleViewUser(u)}>View</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <hr />

      {/* Stores */}
      <h3>All Stores</h3>
      <div className="row mb-3 g-2">
        <div className="col-md-3">
          <input className="form-control" placeholder="Search name" onChange={e => setStoreQuery({ ...storeQuery, name: e.target.value })} />
        </div>
        <div className="col-md-3">
          <input className="form-control" placeholder="Search email" onChange={e => setStoreQuery({ ...storeQuery, email: e.target.value })} />
        </div>
        <div className="col-md-3">
          <input className="form-control" placeholder="Search address" onChange={e => setStoreQuery({ ...storeQuery, address: e.target.value })} />
        </div>
        <div className="col-md-3">
          <button className="btn btn-secondary w-100" onClick={fetchStores}>Filter Stores</button>
        </div>
      </div>

      <div className="table-responsive mb-5">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              {['name', 'email', 'address', 'average_rating'].map(field => (
                <th key={field}>
                  {field === 'average_rating' ? 'Average Rating' : field.charAt(0).toUpperCase() + field.slice(1)}
                  {' '}
                  <span role="button" onClick={() => handleStoreSort(field, 'asc')}>↑</span>&nbsp;&nbsp;&nbsp;
                  <span role="button" onClick={() => handleStoreSort(field, 'desc')}>↓</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loadingStores ? (
              <tr><td colSpan="4">Loading stores...</td></tr>
            ) : stores.length === 0 ? (
              <tr><td colSpan="4">No stores found.</td></tr>
            ) : (
              stores.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.address}</td>
                  <td>{s.average_rating}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
