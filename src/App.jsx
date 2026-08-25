import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import SettlementsPage from './pages/SettlementsPage';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-center mt-16 text-gray-400 text-sm">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><ExpensesPage /></PrivateRoute>} />
        <Route path="/groups" element={<PrivateRoute><GroupsPage /></PrivateRoute>} />
        <Route path="/groups/:id" element={<PrivateRoute><GroupDetailPage /></PrivateRoute>} />
        <Route path="/settlements" element={<PrivateRoute><SettlementsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <AppRoutes />
      </ExpenseProvider>
    </AuthProvider>
  );
}
