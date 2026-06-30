import React from 'react';
import { BookOpen, GraduationCap, CheckCircle2, Clock, Users, Award, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const STUDENT_METRICS = [
  { id: 1, name: "Sarika Chaudhary", progress: 92, completedAssignments: 8, pendingReview: 0 },
  { id: 2, name: "Mohit Mudgil", progress: 85, completedAssignments: 7, pendingReview: 1 },
  { id: 3, name: "Aman Gupta", progress: 60, completedAssignments: 5, pendingReview: 0 }
];

export default function FacultyDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <GraduationCap className="text-orange-600 w-8 h-8" />
            FACULTY CLASSROOM DASHBOARD
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Audit student performance profiles, curriculum logs, and assignments evaluation indices
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-full">
          <Award size={14} />
          <span>Active Students: {STUDENT_METRICS.length}</span>
        </div>
      </div>

      {/* Classroom Stats summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Average Class Progress</span>
          <div className="text-2xl font-black text-orange-600 mt-1 font-mono">79%</div>
          <span className="text-[9px] font-mono text-green-600 block mt-1">↑ Improved 2.4% this week</span>
        </div>

        <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Pending Evaluations</span>
          <div className="text-2xl font-black text-orange-600 mt-1 font-mono">1 Assignment</div>
          <span className="text-[9px] font-mono text-zinc-500 block mt-1">Due: Today</span>
        </div>

        <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Classroom Rank Index</span>
          <div className="text-2xl font-black text-orange-600 mt-1 font-mono">Tier-2 Elite</div>
          <span className="text-[9px] font-mono text-zinc-550 block mt-1">Based on global institution scores</span>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm text-left">
        <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider mb-4">
          Student Progress Roster
        </h2>

        <div className="border border-zinc-200 rounded-xl overflow-hidden font-mono text-xs">
          <div className="grid grid-cols-4 bg-zinc-55 border-b border-zinc-200 font-bold p-3">
            <span>Student Name</span>
            <span>Progress Pct</span>
            <span>Completed MCQs</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-zinc-200 bg-zinc-50/20">
            {STUDENT_METRICS.map((student) => (
              <div key={student.id} className="grid grid-cols-4 p-3 items-center">
                <span className="font-bold text-zinc-900">{student.name}</span>
                <span className="text-orange-600 font-bold">{student.progress}%</span>
                <span>{student.completedAssignments} / 8</span>
                <span className={`text-[10px] font-bold ${
                  student.pendingReview > 0 ? 'text-amber-500' : 'text-green-600'
                }`}>{student.pendingReview > 0 ? 'Action Needed' : 'Completed'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
