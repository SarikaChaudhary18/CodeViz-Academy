import React from 'react';
import { HelpCircle, CheckCircle, RefreshCw, Key, ShieldAlert, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const ASSIGNMENTS = [
  { id: 1, title: "Recursion Base Case Scopes", due: "Tomorrow", score: "Pending Review" },
  { id: 2, title: "Implement Bubble Sort swap routine", due: "Completed", score: "100 / 100" }
];

export default function StudentClassroom() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <BookOpen className="text-orange-600 w-8 h-8" />
          STUDENT CLASSROOM VIEW
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Review assignments checklists, announcements, and evaluation records
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Assignments checklist (Left) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm text-left space-y-4">
          <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">
            Active Assignments
          </h2>

          <div className="space-y-3">
            {ASSIGNMENTS.map((ass) => (
              <div key={ass.id} className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-extrabold text-zinc-900">{ass.title}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">Due: {ass.due}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-orange-600 font-bold block">{ass.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements feed (Right) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider border-b border-zinc-100 pb-3">
              Announcements
            </h2>

            <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl space-y-2">
              <span className="text-[9px] font-mono text-orange-600 uppercase font-bold block">Prof. Sarika Chaudhary</span>
              <p className="text-xs text-zinc-700 leading-relaxed font-semibold">
                "Please complete the Recursion Base Case Scopes checklist before tomorrow's live sandbox evaluation."
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
