import React, { useState } from 'react';
import { User, FileText, Code, Globe, Link as LinkIcon, Award, Briefcase, Edit3, Check, X, Github, ExternalLink } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Portfolio() {
  const { user, updateProfile } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [bio, setBio] = useState(user?.bio || '');
  const [github, setGithub] = useState(user?.github || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [targetCompany, setTargetCompany] = useState(user?.targetCompany || '');
  const [leetcode, setLeetcode] = useState(user?.codingProfiles?.leetcode || '');
  const [codechef, setCodechef] = useState(user?.codingProfiles?.codechef || '');
  const [codeforces, setCodeforces] = useState(user?.codingProfiles?.codeforces || '');

  // Sync state if user changes/loads
  React.useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setGithub(user.github || '');
      setTargetRole(user.targetRole || '');
      setTargetCompany(user.targetCompany || '');
      setLeetcode(user.codingProfiles?.leetcode || '');
      setCodechef(user.codingProfiles?.codechef || '');
      setCodeforces(user.codingProfiles?.codeforces || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await updateProfile({
        bio,
        github,
        targetRole,
        targetCompany,
        codingProfiles: {
          leetcode,
          codechef,
          codeforces
        }
      });
      setSuccessMsg('Portfolio updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update portfolio.');
    } finally {
      setLoading(false);
    }
  };

  const mockPortfolio = {
    completedTracks: ["Frontend Track - 90%", "DSA Masterclass - 75%"],
    verifiedProjects: [
      { name: "Real-Time Chat Web Application", tech: "WebSockets, Node.js, Socket.io" },
      { name: "Dockerized Safe Code Runner Container", tech: "Docker, Process isolation, Linux Kernels" }
    ],
    xp: user?.xp || 0,
    level: user?.level || 1
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <Globe className="text-orange-600 w-8 h-8" />
            AUTO-GENERATED PORTFOLIO
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Verify and distribute your synced studyquest performance indices to recruiters
          </p>
        </div>
        
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setErrorMsg('');
          }}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          {isEditing ? (
            <>
              <X size={14} /> Cancel
            </>
          ) : (
            <>
              <Edit3 size={14} /> Edit Profile
            </>
          )}
        </button>
      </div>

      {successMsg && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl text-xs font-mono text-left">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-mono text-left">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm text-left grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Profile Card Summary (Left) */}
        <div className="md:col-span-4 space-y-6 border-b md:border-b-0 md:border-r border-zinc-150 pb-6 md:pb-0 md:pr-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-orange-600 font-black text-white text-xl flex items-center justify-center mx-auto shadow-md">
              LVL {mockPortfolio.level}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-950 leading-tight">{user?.username || 'Student User'}</h3>
              <span className="text-[10px] font-mono text-orange-600 font-bold uppercase tracking-wider">{user?.targetRole || 'Software Engineer'}</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-zinc-100 pt-4 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">CodeViz Level</span>
              <span className="text-zinc-800 font-bold">{mockPortfolio.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Cumulative XP</span>
              <span className="text-orange-600 font-bold">{mockPortfolio.xp} XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Target Company</span>
              <span className="text-zinc-800 font-bold">{user?.targetCompany || 'Google'}</span>
            </div>
          </div>

          {/* Social Badges */}
          {(user?.github || leetcode || codechef || codeforces) && (
            <div className="space-y-2 border-t border-zinc-100 pt-4 text-[11px] font-mono">
              <span className="text-zinc-400 uppercase font-bold text-[9px] block">Coding Profiles</span>
              <div className="flex flex-col gap-1.5">
                {user?.github && (
                  <a
                    href={github.startsWith('http') ? github : `https://github.com/${github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-zinc-650 hover:text-orange-600"
                  >
                    <span className="flex items-center gap-1.5"><Github size={12} /> GitHub</span>
                    <span className="truncate max-w-[120px] text-zinc-850 font-bold">{github}</span>
                  </a>
                )}
                {leetcode && (
                  <a
                    href={`https://leetcode.com/${leetcode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-zinc-650 hover:text-orange-600"
                  >
                    <span className="flex items-center gap-1.5"><Code size={12} /> LeetCode</span>
                    <span className="truncate max-w-[120px] text-zinc-850 font-bold">{leetcode}</span>
                  </a>
                )}
                {codechef && (
                  <a
                    href={`https://codechef.com/users/${codechef}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-zinc-650 hover:text-orange-600"
                  >
                    <span className="flex items-center gap-1.5"><Code size={12} /> CodeChef</span>
                    <span className="truncate max-w-[120px] text-zinc-855 font-bold">{codechef}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Portfolio Details or Edit Form (Right) */}
        <div className="md:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form
                key="edit-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSave}
                className="space-y-4 text-left"
              >
                <h3 className="text-sm font-bold font-mono text-zinc-900 uppercase tracking-widest border-b border-zinc-150 pb-2">
                  Update Portfolio Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                      Target Role
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Frontend Developer"
                      className="w-full border border-zinc-250 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                      Target Company
                    </label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. Google"
                      className="w-full border border-zinc-250 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                    Executive Biography
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your background and preparation targets..."
                    className="w-full border border-zinc-250 rounded-xl p-3 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-900 resize-none"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <span className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                    Profile Handles
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase">
                        GitHub Username/URL
                      </label>
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="SarikaChaudhary18"
                        className="w-full border border-zinc-250 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase">
                        LeetCode Username
                      </label>
                      <input
                        type="text"
                        value={leetcode}
                        onChange={(e) => setLeetcode(e.target.value)}
                        placeholder="sarika_leetcode"
                        className="w-full border border-zinc-250 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 bg-white text-zinc-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-150 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-500 font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow flex items-center gap-1.5"
                  >
                    {loading ? 'Saving...' : (
                      <>
                        <Check size={12} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="view-portfolio"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6"
              >
                {/* Bio */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                    <FileText size={12} className="text-orange-600" /> Executive Bio
                  </span>
                  <p className="text-xs text-zinc-700 leading-relaxed font-semibold">
                    {user?.bio || "Describe your background, skills, and corporate preparation sprint milestones. Click 'Edit Profile' to customize this dashboard."}
                  </p>
                </div>

                {/* Projects */}
                <div className="space-y-3 border-t border-zinc-100 pt-4">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                    <Code size={12} className="text-orange-600" /> Verified Capstones
                  </span>
                  <div className="space-y-3">
                    {mockPortfolio.verifiedProjects.map((p, i) => (
                      <div key={i} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl">
                        <h4 className="text-xs font-bold text-zinc-900 leading-tight">{p.name}</h4>
                        <span className="text-[9px] font-mono text-zinc-500 mt-1 block">{p.tech}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curriculum Index */}
                <div className="space-y-3 border-t border-zinc-100 pt-4">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                    <Award size={12} className="text-orange-600" /> Verified Curriculum Completion
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {mockPortfolio.completedTracks.map((track, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-50 border border-orange-100 text-[10px] font-mono font-bold text-orange-700 rounded-lg">
                        ✓ {track}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Share links */}
                <div className="pt-4 border-t border-zinc-100 flex gap-4">
                  {user?.github && (
                    <a 
                      href={github.startsWith('http') ? github : `https://github.com/${github}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      <LinkIcon size={12} /> GitHub Profile <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
