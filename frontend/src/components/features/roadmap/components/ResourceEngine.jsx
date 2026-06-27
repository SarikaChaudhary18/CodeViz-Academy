import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Award, BookOpen, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';

const CATEGORIES = [
  { id: 'courses', label: '🎥 Courses', title: 'Top Video Courses' },
  { id: 'books', label: '📚 Books', title: 'Recommended Textbooks' },
  { id: 'repos', label: '🐙 Repos', title: 'Featured Open Source Repos' },
  { id: 'certs', label: '🏆 Certifications', title: 'Industry Valued Certifications' }
];

const RESOURCES = {
  'courses': [
    { title: "take U forward DSA Sheet A-Z", provider: "take U forward", type: "Playlists", rate: "4.9", cost: "Free", duration: "120 hrs", difficulty: "All Levels", link: "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz", desc: "Structured conceptual guides to competitive programming topics.", thumbnail: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)" },
    { title: "Sigma Web Development Boot Camp", provider: "CodeWithHarry", type: "Playlists", rate: "4.8", cost: "Free", duration: "80 hrs", difficulty: "Beginner", link: "https://www.youtube.com/playlist?list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w", desc: "Complete HTML, CSS, JS and server-side deployment guide.", thumbnail: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)" },
    { title: "Chai aur React Backend Masterclass", provider: "Chai aur Code", type: "Playlists", rate: "4.9", cost: "Free", duration: "50 hrs", difficulty: "Intermediate", link: "https://www.youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW", desc: "Advanced engineering design patterns, routing & JWT authentications.", thumbnail: "linear-gradient(135deg, #a855f7 0%, #db2777 100%)" }
  ],
  'books': [
    { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", type: "System Design", rate: "5.0", cost: "Paid", duration: "25 hrs", difficulty: "Advanced", link: "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/", desc: "The definitive guide to distributed databases, storage models, and replication systems.", thumbnail: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
    { title: "Clean Architecture", author: "Robert C. Martin", type: "Architectures", rate: "4.7", cost: "Paid", duration: "15 hrs", difficulty: "Intermediate", link: "https://www.pearson.com/en-us/subject-catalog/p/clean-architecture-a-craftsmans-guide-to-software-structure-and-design/P200000000378/9780134494166", desc: "Covers SOLID components, dependency rules, and database decoupling interfaces.", thumbnail: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
    { title: "Cracking the Coding Interview", author: "Gayle Laakmann McDowell", type: "FAANG Preparation", rate: "4.8", cost: "Paid", duration: "40 hrs", difficulty: "Intermediate", link: "https://www.careercup.com/book", desc: "189 programming questions and solutions spanning trees, dynamic programming, and heaps.", thumbnail: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" }
  ],
  'repos': [
    { title: "developer-roadmap", author: "kamranahmedse", type: "Sitemap Hub", rate: "4.9", cost: "Free", duration: "Ongoing", difficulty: "All Levels", link: "https://github.com/kamranahmedse/developer-roadmap", desc: "Interactive developer career paths and technology ecosystem maps.", thumbnail: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
    { title: "system-design-primer", author: "donnemartin", type: "Architectures", rate: "5.0", cost: "Free", duration: "Ongoing", difficulty: "Advanced", link: "https://github.com/donnemartin/system-design-primer", desc: "Comprehensive guides to scaling servers, key-value stores, and microservice caches.", thumbnail: "linear-gradient(135deg, #f59e0b 0%, #10b981 100%)" },
    { title: "awesome", author: "sindresorhus", type: "Technology Index", rate: "4.8", cost: "Free", duration: "Ongoing", difficulty: "Beginner", link: "https://github.com/sindresorhus/awesome", desc: "Huge curated collection of high-fidelity markdown lists on developer tools.", thumbnail: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }
  ],
  'certs': [
    { title: "AWS Certified Solutions Architect", provider: "Amazon Web Services", type: "Cloud", rate: "4.9", cost: "$150", duration: "80 hrs", difficulty: "Advanced", link: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", desc: "Validates distributed cloud design, IAM policies, and VPC architecture orchestration.", thumbnail: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" },
    { title: "Google Cloud Engineer Associate", provider: "Google Cloud Portal", type: "Cloud", rate: "4.7", cost: "$125", duration: "60 hrs", difficulty: "Intermediate", link: "https://cloud.google.com/learn/certification/associate-cloud-engineer", desc: "Checks virtual engine instances, container deployments, and quota checks.", thumbnail: "linear-gradient(135deg, #3b82f6 0%, #0284c7 100%)" },
    { title: "Docker Certified Associate (DCA)", provider: "Docker / Mirantis", type: "DevOps", rate: "4.8", cost: "$195", duration: "45 hrs", difficulty: "Intermediate", link: "https://www.mirantis.com/training/docker-certification-associate-exam/", desc: "Tests container build instructions, volume storage hooks, and Swarm clusters.", thumbnail: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" }
  ]
};

export default function ResourceEngine() {
  const [activeCategory, setActiveCategory] = useState('courses');
  const scrollContainerRef = useRef(null);

  const activeResources = RESOURCES[activeCategory] || [];

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5 space-y-6 flex flex-col flex-1 relative overflow-hidden group/resources">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-60 h-60 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 z-10">
        <div>
          <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <Award size={18} className="text-emerald-400" />
            Netflix-Style Resource Hub
          </h4>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Browse through courses, textbooks, source code repositories, and certification paths.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none self-start md:self-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                activeCategory === cat.id
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border-transparent text-slate-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative flex items-center z-10">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-[-12px] z-20 w-10 h-10 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition-all opacity-0 group-hover/resources:opacity-100 shadow-xl cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Scrolling Resource Cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-none py-4 px-2 w-full snap-x snap-mandatory"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {activeResources.map((item, idx) => (
            <motion.a
              whileHover={{ scale: 1.05, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-80 bg-slate-950/80 border border-white/5 hover:border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl transition-all relative snap-start"
            >
              {/* Thumbnail Container */}
              <div 
                className="h-32 w-full flex flex-col justify-between p-4 relative"
                style={{ background: item.thumbnail || 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }}
              >
                {/* Visual Overlay */}
                <div className="absolute inset-0 bg-slate-950/20 mix-blend-overlay" />

                <div className="flex justify-between items-start z-10">
                  <span className="text-[10px] bg-slate-950/60 border border-white/10 px-2 py-0.5 rounded-full text-slate-300 font-medium">
                    {item.type}
                  </span>
                  
                  <span className="text-xs bg-slate-950/60 border border-white/10 px-2 py-0.5 rounded-full text-amber-400 font-bold flex items-center gap-0.5">
                    <Star size={11} className="fill-current" /> {item.rate}
                  </span>
                </div>

                <div className="z-10">
                  <p className="text-[10px] text-white/80 font-mono uppercase tracking-wider">
                    {item.author || item.provider}
                  </p>
                  <h5 className="text-sm font-bold text-white leading-snug mt-0.5 drop-shadow-md truncate">
                    {item.title}
                  </h5>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-4 space-y-4">
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-sans min-h-[54px]">
                  {item.desc}
                </p>

                {/* Metadata Row */}
                <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-3">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>⏱ {item.duration}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-400">{item.difficulty}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[9px] uppercase">
                    Cost: {item.cost}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-[-12px] z-20 w-10 h-10 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition-all opacity-0 group-hover/resources:opacity-100 shadow-xl cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>

    </div>
  );
}
