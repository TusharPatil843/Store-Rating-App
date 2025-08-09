import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/authContext';
import Navbar from '../components/Navbar';

const UserDashboard = () => {
  const { logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [storeRatings, setStoreRatings] = useState({});
  const [query, setQuery] = useState({ name: '', address: '' });
  const [inputRatings, setInputRatings] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: '', direction: '' });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchStores = async () => {
    const params = new URLSearchParams(query).toString();
    const res = await API.get(`/stores?${params}`);
    setStores(res.data);
  };

  const fetchRatingsForUser = async (storeId) => {
    const res = await API.get(`/ratings/store/${storeId}`);
    setStoreRatings(prev => ({
      ...prev,
      [storeId]: {
        average: res.data.average_rating,
        userRating: res.data.user_rating || ''
      }
    }));
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    stores.forEach(store => {
      fetchRatingsForUser(store.id);
    });
  }, [stores]);

  const handleRatingChange = (storeId, value) => {
    setInputRatings(prev => ({
      ...prev,
      [storeId]: value
    }));
  };

  const handleRatingSubmit = async (storeId) => {
    const ratingValue = parseInt(inputRatings[storeId]);
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return showToast('Rating must be between 1 and 5', 'danger');
    }

    try {
      await API.post(`/ratings/${storeId}`, { rating: ratingValue });
      showToast('Rating submitted!');
      fetchRatingsForUser(storeId);
      setInputRatings(prev => ({ ...prev, [storeId]: '' }));
    } catch (err) {
      showToast(err.response?.data?.msg || 'Failed to submit rating', 'danger');
    }
  };

  const sortStores = (field, direction) => {
    const sorted = [...stores].sort((a, b) => {
      let valA, valB;
      if (field === 'average') {
        valA = storeRatings[a.id]?.average || 0;
        valB = storeRatings[b.id]?.average || 0;
      } else if (field === 'userRating') {
        valA = storeRatings[a.id]?.userRating || 0;
        valB = storeRatings[b.id]?.userRating || 0;
      } else {
        valA = a[field]?.toString().toLowerCase() || '';
        valB = b[field]?.toString().toLowerCase() || '';
      }

      return direction === 'asc'
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });

    setStores(sorted);
    setSortConfig({ field, direction });
  };

  const renderSortArrows = (field) => (
    <>
      <span onClick={() => sortStores(field, 'asc')} style={{ cursor: 'pointer', marginLeft: 5 }}>↑</span>&nbsp;&nbsp;&nbsp;
      <span onClick={() => sortStores(field, 'desc')} style={{ cursor: 'pointer', marginLeft: 5 }}>↓</span>
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
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast({ show: false, message: '', type: 'success' })}></button>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>User Dashboard</h2>
      </div>

      <div className="mb-4">
        <h4>Search Stores</h4>
        <div className="row g-2">
          <div className="col-md-5">
            <input
              className="form-control"
              placeholder="Search name"
              onChange={e => setQuery({ ...query, name: e.target.value })}
            />
          </div>
          <div className="col-md-5">
            <input
              className="form-control"
              placeholder="Search address"
              onChange={e => setQuery({ ...query, address: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100" onClick={fetchStores}>Search</button>
          </div>
        </div>
      </div>

      <h4>All Stores</h4>
      {stores.length === 0 ? (
        <p>No stores found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Name {renderSortArrows('name')}</th>
                <th>Address {renderSortArrows('address')}</th>
                <th>Average Rating {renderSortArrows('average')}</th>
                <th>Your Rating {renderSortArrows('userRating')}</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(store => {
                const ratingData = storeRatings[store.id] || {};
                const inputValue = inputRatings[store.id] || '';

                return (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.address}</td>
                    <td>{ratingData.average ?? 'Loading...'}</td>
                    <td>{ratingData.userRating || 'Not rated yet'}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={inputValue}
                          placeholder="1–5"
                          onChange={(e) => handleRatingChange(store.id, e.target.value)}
                          className="form-control"
                          style={{ width: '70px' }}
                        />
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleRatingSubmit(store.id)}
                        >
                          {ratingData.userRating ? 'Modify' : 'Submit'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
