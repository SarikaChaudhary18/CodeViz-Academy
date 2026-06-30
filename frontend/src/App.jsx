import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './hooks/useStore';

// Layout & Styling
import AppLayout from './components/layout/AppLayout';

// Features
import Hero from './components/features/Hero';
import Auth from './components/features/auth/Auth';
import Dashboard from './components/features/dashboard/Dashboard';
import CompanyPrep from './components/features/company-prep/CompanyPrep';
import Roadmap from './components/features/roadmap/Roadmap';
import ResumeAuditor from './components/features/resume-auditor/ResumeAuditor';
import MockInterview from './components/features/mock-interview/MockInterview';
import CommunitiesChat from './components/features/communities-chat/CommunitiesChat';
import Hackathons from './components/features/hackathons/Hackathons';
import DsaSheets from './components/features/dsa-sheets/DsaSheets';
import DsaSandbox from './components/features/dsa-sheets/DsaSandbox';
import Leaderboard from './components/features/friends/Leaderboard';
import PlatformTracker from './components/features/platform-tracker/PlatformTracker';

function ProtectedRoute({ children, noLayout = false }) {
  const { isAuthenticated, authLoading, checkAuth, openAuthModal } = useStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openAuthModal(location.pathname);
    }
  }, [authLoading, isAuthenticated, location.pathname, openAuthModal]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center flex-col gap-4">
        {/* Cyberpunk glowing loading spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute w-full h-full rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin" />
          <div className="absolute w-10 h-10 rounded-full border-4 border-orange-400/10 border-b-orange-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-xs font-mono tracking-widest text-orange-600 uppercase animate-pulse">Syncing StudyQuest...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (noLayout) return children;
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  const { checkAuth } = useStore();

  useEffect(() => {
    document.documentElement.classList.add("light");
    localStorage.setItem("auth_theme", "light");
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Hero />} />

        {/* Authentication routes */}
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth isRegisterMode />} />

        {/* Protected Application Stack */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-prep"
          element={
            <ProtectedRoute>
              <CompanyPrep />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmaps"
          element={
            <ProtectedRoute>
              <Roadmap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-auditor"
          element={
            <ProtectedRoute>
              <ResumeAuditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mock-interview"
          element={
            <ProtectedRoute>
              <MockInterview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/communities"
          element={
            <ProtectedRoute>
              <CommunitiesChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hackathons"
          element={
            <ProtectedRoute>
              <Hackathons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dsa-sheets"
          element={
            <ProtectedRoute>
              <DsaSheets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dsa-sheets/solve/:problemId"
          element={
            <ProtectedRoute noLayout>
              <DsaSandbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trackers"
          element={
            <ProtectedRoute>
              <PlatformTracker />
            </ProtectedRoute>
          }
        />

        {/* Wildcard redirects */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
