import React from 'react';
import { Award, Briefcase, CheckCircle2, TrendingUp, ShieldAlert, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const EMPLOYEES = [
  { id: 1, name: "Sarika Chaudhary", completedCourses: 4, score: 95, badges: 3 },
  { id: 2, name: "Mohit Mudgil", completedCourses: 3, score: 88, badges: 2 }
];

export default function EmployeeDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <Briefcase className="text-orange-600 w-8 h-8" />
            ENTERPRISE LEARNING DASHBOARD
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Audit corporate employee performance records and certification statuses
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-full">
          <Award size={14} />
          <span>Active Accounts: {EMPLOYEES.length}</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Compliance Level</span>
          <div className="text-2xl font-black text-orange-600 mt-1 font-mono">92%</div>
          <span className="text-[9px] font-mono text-green-600 block mt-1">↑ Improved 1.8% this month</span>
        </div>

        <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Average Course Score</span>
          <div className="text-2xl font-black text-orange-600 mt-1 font-mono">91.5%</div>
        </div>

        <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm text-left">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Badges Awarded</span>
          <div className="text-2xl font-black text-orange-600 mt-1 font-mono">5 Badges</div>
        </div>
      </div>

      {/* Roster */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm text-left">
        <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider mb-4">
          Employee Learning Roster
        </h2>

        <div className="border border-zinc-200 rounded-xl overflow-hidden font-mono text-xs">
          <div className="grid grid-cols-4 bg-zinc-55 border-b border-zinc-200 font-bold p-3">
            <span>Employee Name</span>
            <span>Completed Courses</span>
            <span>Average Score</span>
            <span>Badges Earned</span>
          </div>

          <div className="divide-y divide-zinc-200 bg-zinc-50/20">
            {EMPLOYEES.map((emp) => (
              <div key={emp.id} className="grid grid-cols-4 p-3 items-center">
                <span className="font-bold text-zinc-900">{emp.name}</span>
                <span>{emp.completedCourses} / 5</span>
                <span className="text-orange-600 font-bold">{emp.score}%</span>
                <span>{emp.badges} Badges</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
