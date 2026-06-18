import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './hooks/useStore';

// Layout & Styling
import AppLayout from './components/layout/AppLayout';

// Features
import Auth from './components/features/auth/Auth';
import Dashboard from './components/features/dashboard/Dashboard';
import CompanyPrep from './components/features/company-prep/CompanyPrep';
import Roadmap from './components/features/roadmap/Roadmap';
import ResumeAuditor from './components/features/resume-auditor/ResumeAuditor';
import MockInterview from './components/features/mock-interview/MockInterview';
import CommunitiesChat from './components/features/communities-chat/CommunitiesChat';
import Hackathons from './components/features/hackathons/Hackathons';
import DsaSheets from './components/features/dsa-sheets/DsaSheets';
import Leaderboard from './components/features/friends/Leaderboard';
import PlatformTracker from './components/features/platform-tracker/PlatformTracker';

function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading, checkAuth } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center flex-col gap-4">
        {/* Cyberpunk glowing loading spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute w-full h-full rounded-full border-4 border-violet-500/10 border-t-violet-500 animate-spin" />
          <div className="absolute w-10 h-10 rounded-full border-4 border-cyan-400/10 border-b-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-xs font-mono tracking-widest text-cyan-400 text-glow-cyan uppercase animate-pulse">Syncing StudyQuest OS...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  const { checkAuth } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
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
