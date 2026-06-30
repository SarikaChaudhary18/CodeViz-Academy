import React, { useState } from 'react';
import { Calendar, RefreshCw, Eye, BrainCircuit, CheckSquare, Sparkles, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const INITIAL_TOPICS = [
  {
    id: 1,
    topicName: "Dynamic Programming Scopes",
    studiedDaysAgo: 5,
    initialRetention: 100,
    currentRetention: 38,
    status: "Critical Decay",
    reviewAction: "Review Knapsack DP state transitions."
  },
  {
    id: 2,
    topicName: "Graph Traversals (BFS & DFS)",
    studiedDaysAgo: 2,
    initialRetention: 100,
    currentRetention: 72,
    status: "Muted Decay",
    reviewAction: "Trace graph adjacency lists."
  },
  {
    id: 3,
    topicName: "JS Lexical Environments",
    studiedDaysAgo: 1,
    initialRetention: 100,
    currentRetention: 90,
    status: "Stable Retention",
    reviewAction: "Review lexical environment lexical parents."
  }
];

// Ebbinghaus Forgetting Curve points: R = e^(-t/S)
const CURVE_DATA = [
  { day: 'Day 0', retention: 100 },
  { day: 'Day 1', retention: 80 },
  { day: 'Day 2', retention: 65 },
  { day: 'Day 3', retention: 55 },
  { day: 'Day 4', retention: 45 },
  { day: 'Day 5', retention: 38 },
  { day: 'Day 6', retention: 32 },
  { day: 'Day 7', retention: 28 },
];

export default function ForgettingPrediction() {
  const [topics, setTopics] = useState(INITIAL_TOPICS);

  const boostRetention = (topicId) => {
    setTopics(prevTopics => 
      prevTopics.map(topic => 
        topic.id === topicId 
          ? { ...topic, currentRetention: 100, status: "Fully Restored", studiedDaysAgo: 0 } 
          : topic
      )
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <BrainCircuit className="text-orange-600 w-8 h-8" />
          FORGETTING PREDICTION
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Predict cognitive memory decay using Ebbinghaus curve metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Prediction list & alerts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-mono font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
              <TrendingDown size={14} /> Topic Decay Checklists
            </h2>
            <p className="text-xs text-zinc-550 leading-relaxed">
              Based on spaced repetition metrics, these topics are decaying from active cache. Reviewing them today restores them to 100% strength.
            </p>

            <div className="space-y-4 pt-2">
              {topics.map((topic) => (
                <div 
                  key={topic.id}
                  className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-zinc-300"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-zinc-900 leading-tight">
                      {topic.topicName}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Studied {topic.studiedDaysAgo} days ago • Status: <span className={`font-bold ${
                        topic.currentRetention < 40 ? 'text-red-500' :
                        topic.currentRetention < 85 ? 'text-amber-500' : 'text-green-600'
                      }`}>{topic.status}</span>
                    </p>
                    <p className="text-[11px] text-zinc-650 italic mt-1 leading-normal">
                      "{topic.reviewAction}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-150">
                    <div className="text-right">
                      <span className="text-[9px] text-zinc-400 font-mono block">Retention</span>
                      <span className={`text-lg font-black font-mono ${
                        topic.currentRetention < 40 ? 'text-red-600' :
                        topic.currentRetention < 85 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {topic.currentRetention}%
                      </span>
                    </div>

                    <button 
                      onClick={() => boostRetention(topic.id)}
                      disabled={topic.currentRetention === 100}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-mono font-bold transition-all shadow-sm ${
                        topic.currentRetention === 100
                          ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer'
                      }`}
                    >
                      <RefreshCw size={10} className={topic.currentRetention === 100 ? '' : 'animate-spin-slow'} style={{ animationDuration: '4s' }} /> Boost Cache
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Retention Decay Chart */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-orange-600" /> Retention Curve Profile
            </h2>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
              Memory decays exponentially. Review intervals reset the decay gradient slope.
            </p>

            <div className="h-56 w-full pr-4 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CURVE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: 'monospace' }} stroke="#71717a" />
                  <YAxis tick={{ fontSize: 9, fontFamily: 'monospace' }} stroke="#71717a" domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: 10, fontFamily: 'monospace', borderRadius: 8 }} />
                  <Line 
                    type="monotone" 
                    dataKey="retention" 
                    stroke="#ea580c" 
                    strokeWidth={2.5} 
                    dot={{ stroke: '#ea580c', strokeWidth: 2, r: 3 }} 
                    activeDot={{ r: 5 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 text-[10px] text-zinc-650 font-mono leading-normal">
              <strong>Spaced Interval Formula:</strong> Review after 1 day, 3 days, 7 days, 15 days, and 30 days to seal concepts permanently into your long-term memory stack.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
