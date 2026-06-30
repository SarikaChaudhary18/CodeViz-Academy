import React, { useState } from 'react';
import { Search, BookOpen, Clock, Play, GraduationCap, ChevronRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const COURSES_DATA = [
  {
    id: 1,
    title: 'Advanced DSA Masterclass',
    category: 'DSA',
    lessons: 24,
    duration: '18h 45m',
    progress: 75,
    difficulty: 'Hard',
    instructor: 'Sarika Chaudhary',
    description: 'Master trees, graphs, dynamic programming, and advanced algorithmic thinking for top product placements.'
  },
  {
    id: 2,
    title: 'Full-Stack Next.js Developer',
    category: 'Development',
    lessons: 32,
    duration: '22h 10m',
    progress: 40,
    difficulty: 'Medium',
    instructor: 'Mohit Mudgil',
    description: 'Build enterprise-grade web applications with server components, database sync, and WebSocket architectures.'
  },
  {
    id: 3,
    title: 'System Design Fundamentals',
    category: 'Systems',
    lessons: 15,
    duration: '12h 30m',
    progress: 0,
    difficulty: 'Hard',
    instructor: 'AI Socratic Mentor',
    description: 'Learn load balancing, horizontal scalability, caching strategies, and database sharding with microservices.'
  },
  {
    id: 4,
    title: 'Modern UI/UX with Tailwind & Framer Motion',
    category: 'Frontend',
    lessons: 18,
    duration: '9h 15m',
    progress: 90,
    difficulty: 'Easy',
    instructor: 'Sarika Chaudhary',
    description: 'Design immersive web structures with smooth transitions, interactive animations, and responsive bento grids.'
  }
];

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'DSA', 'Frontend', 'Development', 'Systems'];

  const filteredCourses = COURSES_DATA.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <GraduationCap className="text-orange-600 w-8 h-8" />
            LEARNING COURSES
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Build production skills with interactive curriculums
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-full">
          <Award size={14} />
          <span>Earn verified placement badges</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-900"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-bold transition-all ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-zinc-200 hover:border-orange-250 p-6 flex flex-col justify-between hover:shadow-lg transition-all"
          >
            <div>
              {/* Category & Difficulty Tag */}
              <div className="flex justify-between items-center mb-3">
                <span className="px-2 py-0.5 bg-orange-50 border border-orange-100 text-[9px] font-bold text-orange-600 font-mono rounded">
                  {course.category}
                </span>
                <span className={`text-[9px] font-mono font-bold uppercase ${
                  course.difficulty === 'Hard' ? 'text-red-500' :
                  course.difficulty === 'Medium' ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {course.difficulty}
                </span>
              </div>

              {/* Title & Info */}
              <h3 className="text-base font-extrabold text-zinc-950 tracking-tight mb-2 hover:text-orange-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-xs text-zinc-650 leading-relaxed mb-4">
                {course.description}
              </p>
              
              <div className="text-[10px] text-zinc-500 font-mono mb-6">
                Instructor: <span className="font-bold text-zinc-700">{course.instructor}</span>
              </div>
            </div>

            {/* Progress & Bottom Bar */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              {course.progress > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-zinc-500">Progress</span>
                    <span className="font-bold text-orange-600">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-600 h-full transition-all duration-500" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-zinc-500 font-mono">Not started yet</div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1"><BookOpen size={12} /> {course.lessons} lessons</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                </div>

                <button className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-[10px] font-mono font-bold transition-all shadow-sm">
                  {course.progress > 0 ? 'Resume' : 'Start'} <Play size={10} className="fill-white" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 font-mono text-xs">
            No courses found matching the active search parameters.
          </div>
        )}
      </div>
    </div>
  );
}
