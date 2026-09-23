import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Authenticated User Pages
import { UserDashboardPage } from './pages/UserDashboardPage';
import { GenerateReadingPage } from './pages/GenerateReadingPage';
import { ReadingResultPage } from './pages/ReadingResultPage';
import { ReadingHistoryPage } from './pages/ReadingHistoryPage';
import { ProfilePage } from './pages/ProfilePage';

// Astrologer Pages
import { AstrologerDashboardPage } from './pages/AstrologerDashboardPage';
import { ReadingReviewPage } from './pages/ReadingReviewPage';

// Admin Pages
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';

// Auxiliary Pages
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

import './App.css';

export const App: React.FC = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reading/new"
            element={
              <ProtectedRoute>
                <GenerateReadingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reading/result"
            element={
              <ProtectedRoute>
                <ReadingResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <ReadingHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Astrologer Protected Routes */}
          <Route
            path="/astrologer"
            element={
              <ProtectedRoute allowedRoles={['astrologer', 'admin']}>
                <AstrologerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/astrologer/readings/:id"
            element={
              <ProtectedRoute allowedRoles={['astrologer', 'admin']}>
                <ReadingReviewPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Auxiliary Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default App;
