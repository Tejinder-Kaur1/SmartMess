import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import StudentMenu from './pages/student/Menu';
import StudentAttendance from './pages/student/Attendance';
import StudentFeedback from './pages/student/Feedback';
import StudentComplaints from './pages/student/Complaints';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMenu from './pages/admin/Menu';
import AdminAttendance from './pages/admin/Attendance';
import AdminFeedback from './pages/admin/Feedback';
import AdminComplaints from './pages/admin/Complaints';
import AdminWastage from './pages/admin/Wastage';
import AdminReports from './pages/admin/Reports';

const ProtectedRoute = ({ children, allowedRole }: { children: JSX.Element, allowedRole: 'STUDENT' | 'ADMIN' }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace /> : <Navigate to="/login" replace />
      } />
      <Route path="/login" element={<Login />} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="STUDENT"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/menu" element={<ProtectedRoute allowedRole="STUDENT"><StudentMenu /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute allowedRole="STUDENT"><StudentAttendance /></ProtectedRoute>} />
      <Route path="/student/feedback" element={<ProtectedRoute allowedRole="STUDENT"><StudentFeedback /></ProtectedRoute>} />
      <Route path="/student/complaints" element={<ProtectedRoute allowedRole="STUDENT"><StudentComplaints /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/menu" element={<ProtectedRoute allowedRole="ADMIN"><AdminMenu /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute allowedRole="ADMIN"><AdminAttendance /></ProtectedRoute>} />
      <Route path="/admin/feedback" element={<ProtectedRoute allowedRole="ADMIN"><AdminFeedback /></ProtectedRoute>} />
      <Route path="/admin/complaints" element={<ProtectedRoute allowedRole="ADMIN"><AdminComplaints /></ProtectedRoute>} />
      <Route path="/admin/wastage" element={<ProtectedRoute allowedRole="ADMIN"><AdminWastage /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRole="ADMIN"><AdminReports /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
