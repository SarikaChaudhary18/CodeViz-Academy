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

// New Feature Imports
import Courses from './components/features/courses/Courses';
import Quizzes from './components/features/quizzes/Quizzes';
import SkillDna from './components/features/skill-dna/SkillDna';

import SocraticMentor from './components/features/ai-tools/SocraticMentor';
import BugDetective from './components/features/ai-tools/BugDetective';
import CodeReview from './components/features/ai-tools/CodeReview';
import InterviewSimulator from './components/features/ai-tools/InterviewSimulator';

import ExecutionTrace from './components/features/visualize/ExecutionTrace';
import StepDebugger from './components/features/visualize/StepDebugger';
import ArchitectureVisualizer from './components/features/visualize/ArchitectureVisualizer';

import BuddyFinder from './components/features/community/BuddyFinder';
import CollabRoom from './components/features/community/CollabRoom';
import VideoMeeting from './components/features/community/VideoMeeting';
import Whiteboard from './components/features/community/Whiteboard';

import CodeBattle from './components/features/games/CodeBattle';
import BugHunt from './components/features/games/BugHunt';
import AlgorithmRace from './components/features/games/AlgorithmRace';
import CodeEscapeRoom from './components/features/games/CodeEscapeRoom';
import AdventureHub from './components/features/games/AdventureHub';

import ProjectList from './components/features/projects/ProjectList';
import Portfolio from './components/features/projects/Portfolio';
import AIProjectReviewer from './components/features/projects/AIProjectReviewer';

import RecruiterPortal from './components/features/career/RecruiterPortal';
import FacultyDashboard from './components/features/college/FacultyDashboard';
import StudentClassroom from './components/features/college/StudentClassroom';
import EmployeeDashboard from './components/features/enterprise/EmployeeDashboard';
import Badges from './components/features/enterprise/Badges';

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

        {/* Newly Added Modular Feature Routes */}
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
        <Route path="/skill-dna" element={<ProtectedRoute><SkillDna /></ProtectedRoute>} />

        <Route path="/socratic-mentor" element={<ProtectedRoute><SocraticMentor /></ProtectedRoute>} />
        <Route path="/bug-detective" element={<ProtectedRoute><BugDetective /></ProtectedRoute>} />
        <Route path="/code-review" element={<ProtectedRoute><CodeReview /></ProtectedRoute>} />
        <Route path="/interview-simulator" element={<ProtectedRoute><InterviewSimulator /></ProtectedRoute>} />

        <Route path="/visualizer/execution-trace" element={<ProtectedRoute><ExecutionTrace /></ProtectedRoute>} />
        <Route path="/visualizer/step-debugger" element={<ProtectedRoute><StepDebugger /></ProtectedRoute>} />
        <Route path="/visualizer/architecture" element={<ProtectedRoute><ArchitectureVisualizer /></ProtectedRoute>} />

        <Route path="/community/buddy-finder" element={<ProtectedRoute><BuddyFinder /></ProtectedRoute>} />
        <Route path="/community/collab" element={<ProtectedRoute><CollabRoom /></ProtectedRoute>} />
        <Route path="/community/meeting" element={<ProtectedRoute><VideoMeeting /></ProtectedRoute>} />
        <Route path="/community/whiteboard" element={<ProtectedRoute><Whiteboard /></ProtectedRoute>} />

        <Route path="/games/code-battle" element={<ProtectedRoute><CodeBattle /></ProtectedRoute>} />
        <Route path="/games/bug-hunt" element={<ProtectedRoute><BugHunt /></ProtectedRoute>} />
        <Route path="/games/algo-race" element={<ProtectedRoute><AlgorithmRace /></ProtectedRoute>} />
        <Route path="/games/escape-room" element={<ProtectedRoute><CodeEscapeRoom /></ProtectedRoute>} />
        <Route path="/games/adventure-hub" element={<ProtectedRoute><AdventureHub /></ProtectedRoute>} />

        <Route path="/projects/list" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
        <Route path="/projects/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
        <Route path="/projects/reviewer" element={<ProtectedRoute><AIProjectReviewer /></ProtectedRoute>} />

        <Route path="/career/recruiter" element={<ProtectedRoute><RecruiterPortal /></ProtectedRoute>} />
        <Route path="/college/faculty" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/college/classroom" element={<ProtectedRoute><StudentClassroom /></ProtectedRoute>} />
        <Route path="/enterprise/dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/enterprise/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />

        {/* Wildcard redirects */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
