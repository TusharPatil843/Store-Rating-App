import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/authContext';
import Navbar from '../components/Navbar';

const OwnerDashboard = () => {
  const { logout } = useAuth();
  const [averageRating, setAverageRating] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: '', direction: '' });

  const [toast, setToast] = useState({ show: false, message: '', type: 'danger' });

  const showToast = (message, type = 'danger') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'danger' }), 3000);
  };

  const fetchOwnerRatings = async () => {
    try {
      const res = await API.get('/ratings/owner');
      setAverageRating(res.data.average_rating || 0);
      setRatings(res.data.ratings);
    } catch (err) {
      showToast('Error fetching your store ratings.');
    }
  };

  useEffect(() => {
    fetchOwnerRatings();
  }, []);

  const sortRatings = (field, direction) => {
    const sorted = [...ratings].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (field === 'updated_at') {
        valA = new Date(valA);
        valB = new Date(valB);
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      return direction === 'asc'
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });

    setRatings(sorted);
    setSortConfig({ field, direction });
  };

  const renderSortArrows = (field) => (
    <>
      <span onClick={() => sortRatings(field, 'asc')} style={{ cursor: 'pointer', marginLeft: 5 }}>↑</span>&nbsp;&nbsp;&nbsp;
      <span onClick={() => sortRatings(field, 'desc')} style={{ cursor: 'pointer', marginLeft: 5 }}>↓</span>
    </>
  );

  return (
    <div className="container mt-4">
      <Navbar />

      {/* Toast Container */}
      {toast.show && (
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show text-white bg-${toast.type} border-0`}>
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast({ show: false, message: '', type: 'danger' })}></button>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Store Owner Dashboard</h2>
      </div>

      <h4 className="mb-3">
        Your Store's Average Rating: <span className="badge bg-warning text-dark">⭐ {averageRating}</span>
      </h4>

      <h5 className="mt-4 mb-3">Users Who Rated Your Store</h5>
      {ratings.length === 0 ? (
        <p className="text-muted">No ratings yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>User {renderSortArrows('user_name')}</th>
                <th>Email {renderSortArrows('email')}</th>
                <th>Rating {renderSortArrows('rating')}</th>
                <th>Date {renderSortArrows('updated_at')}</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((r, i) => (
                <tr key={i}>
                  <td>{r.user_name}</td>
                  <td>{r.email}</td>
                  <td>{r.rating}</td>
                  <td>{new Date(r.updated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
