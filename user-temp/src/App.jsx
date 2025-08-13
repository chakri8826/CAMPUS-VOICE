import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ComplaintSubmissionPage from './pages/ComplaintSubmissionPage';
import MyComplaintsPage from './pages/MyComplaintsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/complaints/new" element={
          <ProtectedRoute>
            <ComplaintSubmissionPage />
          </ProtectedRoute>
        } />
        <Route path="/complaints" element={
          <ProtectedRoute>
            <MyComplaintsPage />
          </ProtectedRoute>
        } />
        <Route path="/complaints/:id" element={
          <ProtectedRoute>
            <ComplaintDetailPage />
          </ProtectedRoute>
        } />
        {/* Redirect root to landing page for unauthenticated users */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}