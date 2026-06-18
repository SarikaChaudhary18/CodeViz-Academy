import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../hooks/useStore';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Terminal, LogIn, UserPlus } from 'lucide-react';

export default function Auth({ isRegisterMode = false }) {
  const navigate = useNavigate();
  const { login, register, updateProfile, authLoading, authError } = useStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Custom setup options for first-time profile creation
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [targetCompany, setTargetCompany] = useState('Google');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      if (isRegisterMode) {
        if (!username || !email || !password) {
          setErrorMessage('Please fill in all registration fields.');
          return;
        }
        // Register user
        await register(username, email, password);
        // Save target settings
        await updateProfile({ targetRole, targetCompany });
      } else {
        if (!email || !password) {
          setErrorMessage('Please provide both email and password.');
          return;
        }
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Authentication request failed.');
    }
  };

  const toggleMode = () => {
    setErrorMessage('');
    if (isRegisterMode) {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Cyber Grid Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full filter blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/5 rounded-full filter blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-xl glassmorphism rounded-3xl p-8 relative z-10 box-glow-violet border-white/10"
      >
        {/* Header HUD */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-lg mb-4 text-glow-violet">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans">
            {isRegisterMode ? 'CREATE STUDYQUEST PROFILE' : 'ACCESS STUDYQUEST OS'}
          </h2>
          <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-1">
            {isRegisterMode ? 'INITIALIZE SYSTEM MODULES' : 'VERIFY IDENTITY CREDENTIALS'}
          </p>
        </div>

        {/* Action Error Log */}
        {(errorMessage || authError) && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-mono">
            <span className="font-bold uppercase mr-1">[CRITICAL ERROR]:</span> {errorMessage || authError}
          </div>
        )}

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegisterMode && (
            <div>
              <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. NeoCoder"
                className="w-full bg-white/[0.02] border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-sans"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@studyquest.io"
              className="w-full bg-white/[0.02] border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Access Cipher (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-white/[0.02] border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all font-mono"
            />
          </div>

          {/* Gamification Selections (Registration only) */}
          {isRegisterMode && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 mt-4">
              <div>
                <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Target Discipline</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-3 text-xs text-gray-300 focus:outline-none focus:border-violet-500/50 font-mono"
                >
                  <option value="Frontend Developer">Frontend Dev</option>
                  <option value="Backend Developer">Backend Dev</option>
                  <option value="DevOps Engineer">DevOps Eng</option>
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Fullstack Developer">Fullstack Dev</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5">Target Arena (Company)</label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-3 text-xs text-gray-300 focus:outline-none focus:border-violet-500/50 font-mono"
                >
                  <option value="Google">Google (Go)</option>
                  <option value="Meta">Meta (GraphQL)</option>
                  <option value="Amazon">Amazon (Scale)</option>
                  <option value="Netflix">Netflix (Ops)</option>
                  <option value="Uber">Uber (Realtime)</option>
                </select>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold py-3.5 rounded-xl shadow-lg box-glow-violet active:scale-[0.98] transition-all disabled:opacity-50 text-sm mt-6 cursor-pointer"
          >
            {authLoading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : isRegisterMode ? (
              <>
                <UserPlus size={16} /> Seed Profile
              </>
            ) : (
              <>
                <LogIn size={16} /> Initialize Interface
              </>
            )}
          </button>
        </form>

        {/* Switch Auth mode triggers */}
        <div className="mt-8 text-center border-t border-white/5 pt-6 flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500 font-sans">
            {isRegisterMode ? 'Profile already exists?' : 'New system user?'}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider flex items-center gap-1.5"
          >
            <Sparkles size={12} />
            {isRegisterMode ? 'Switch to Connection Access' : 'Switch to Registration Module'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
