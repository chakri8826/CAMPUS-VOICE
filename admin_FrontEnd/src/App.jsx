import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import AdminPanel from './pages/AdminPanel';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let isAdmin = false;
  try {
    const user = JSON.parse(userStr);
    isAdmin = user && user.role === 'admin';
  } catch {}
  if (!token || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminPanel />
          </AdminProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
