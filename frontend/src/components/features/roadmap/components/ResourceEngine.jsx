import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Play, BookOpen, Star, Award, ShieldCheck } from 'lucide-react';

const RESOURCES = {
  'courses': [
    { title: "take U forward DSA Sheet A-Z", provider: "take U forward", type: "Playlists", rate: "4.9/5", cost: "Free", link: "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz", desc: "Structured conceptual guides to competitive programming topics." },
    { title: "Sigma Web Development Boot Camp", provider: "CodeWithHarry", type: "Playlists", rate: "4.8/5", cost: "Free", link: "https://www.youtube.com/playlist?list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w", desc: "Complete HTML, CSS, JS and server-side deployment guide." },
    { title: "Chai aur React Backend Masterclass", provider: "Chai aur Code", type: "Playlists", rate: "4.9/5", cost: "Free", link: "https://www.youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW", desc: "Advanced engineering design patterns, routing & JWT authentications." }
  ],
  'books': [
    { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", type: "System Design", rate: "5.0/5", link: "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/", desc: "The definitive guide to distributed databases, storage models, and replication systems." },
    { title: "Clean Architecture", author: "Robert C. Martin", type: "Architectures", rate: "4.7/5", link: "https://www.pearson.com/en-us/subject-catalog/p/clean-architecture-a-craftsmans-guide-to-software-structure-and-design/P200000000378/9780134494166", desc: "Covers SOLID components, dependency rules, and database decoupling interfaces." },
    { title: "Cracking the Coding Interview", author: "Gayle Laakmann McDowell", type: "FAANG Preparation", rate: "4.8/5", link: "https://www.careercup.com/book", desc: "189 programming questions and solutions spanning trees, dynamic programming, and heaps." }
  ],
  'repos': [
    { title: "developer-roadmap", author: "kamranahmedse", type: "Sitemap Hub", rate: "278k ⭐", link: "https://github.com/kamranahmedse/developer-roadmap", desc: "Interactive developer career paths and technology ecosystem maps." },
    { title: "system-design-primer", author: "donnemartin", type: "Architectures", rate: "260k ⭐", link: "https://github.com/donnemartin/system-design-primer", desc: "Comprehensive guides to scaling servers, key-value stores, and microservice caches." },
    { title: "awesome", author: "sindresorhus", type: "Technology Index", rate: "310k ⭐", link: "https://github.com/sindresorhus/awesome", desc: "Huge curated collection of high-fidelity markdown lists on developer tools." }
  ],
  'certs': [
    { title: "AWS Certified Solutions Architect", provider: "Amazon Web Services", type: "Cloud Engineering", rate: "Gold Value", cost: "$150", link: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", desc: "Validates distributed cloud design, IAM policies, and VPC architecture orchestration." },
    { title: "Google Cloud Engineer Associate", provider: "Google Cloud Portal", type: "Cloud Engineering", rate: "High Value", cost: "$125", link: "https://cloud.google.com/learn/certification/associate-cloud-engineer", desc: "Checks virtual engine instances, container deployments, and quota checks." },
    { title: "Docker Certified Associate (DCA)", provider: "Docker / Mirantis", type: "DevOps Pipelines", rate: "Gold Value", cost: "$195", link: "https://www.mirantis.com/training/docker-certification-associate-exam/", desc: "Tests container build instructions, volume storage hooks, and Swarm clusters." }
  ]
};

export default function ResourceEngine() {
  const [activeTab, setActiveTab] = useState('courses');

  const activeResources = RESOURCES[activeTab] || [];

  return (
    <div className="glassmorphism rounded-3xl p-6 border-white/5 space-y-6 flex flex-col flex-1 min-h-[400px]">
      
      {/* Header and filter sub-tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award size={16} className="text-emerald-400" />
            Curated Resource Index
          </h4>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-widest">
            Best playlists, textbooks, open source repos, and certifications
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 scrollbar-none overflow-x-auto">
          {[
            { id: 'courses', label: '📺 Courses' },
            { id: 'books', label: '📖 Books' },
            { id: 'repos', label: '🐙 Repos' },
            { id: 'certs', label: '🏆 Certs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-xl text-[9px] font-mono font-bold uppercase transition-all border ${
                activeTab === tab.id
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-white/[0.01] hover:bg-white/[0.03] border-transparent text-zinc-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid displaying items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
        {activeResources.map((item, idx) => (
          <motion.a
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            key={idx}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="glassmorphism rounded-2xl border-white/5 hover:border-emerald-500/20 p-4 flex flex-col justify-between transition-all relative group text-[10px] select-none"
          >
            <div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">
                  {item.author || item.provider || item.type}
                </span>
                <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-0.5">
                  <Star size={9} className="fill-current" /> {item.rate}
                </span>
              </div>

              <h5 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-wide mt-1.5 line-clamp-1 leading-relaxed">
                {item.title}
              </h5>

              <p className="text-[9px] text-zinc-400 font-sans leading-relaxed mt-2 line-clamp-3">
                {item.desc}
              </p>
            </div>

            <div className="flex items-center justify-between gap-1 text-[8px] font-mono text-emerald-400 mt-4 uppercase tracking-wider border-t border-white/5 pt-2">
              <span className="text-zinc-500">Cost: {item.cost || 'Free / Reference'}</span>
              <span className="flex items-center gap-0.5 font-bold">
                Access Resource <ExternalLink size={9} />
              </span>
            </div>
          </motion.a>
        ))}
      </div>

    </div>
  );
}
