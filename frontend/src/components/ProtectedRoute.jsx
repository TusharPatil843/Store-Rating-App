import { useAuth } from '../context/authContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />; // Not logged in

  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />; // Wrong role

  return children;
};

export default ProtectedRoute;
