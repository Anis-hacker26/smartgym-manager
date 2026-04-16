import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LandingPage from './components/LandingPage';
import MemberDashboard from './components/member/MemberDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import MembersList from './components/admin/MembersList';
import AddMember from './components/admin/AddMember';
import MemberDetail from './components/admin/MemberDetail';
import { useEffect } from 'react';

function ProtectedRoute({ children, allowedRole }: { children: JSX.Element; allowedRole: 'ADMIN' | 'MEMBER' }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Member Routes */}
        <Route
          path="/member/dashboard"
          element={
            <ProtectedRoute allowedRole="MEMBER">
              <MemberDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <MembersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members/add"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AddMember />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members/:id"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <MemberDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;