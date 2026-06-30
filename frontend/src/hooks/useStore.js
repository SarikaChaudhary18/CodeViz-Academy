import { create } from 'zustand';
import { api } from '../lib/api';
import { socketService } from '../lib/socket';

export const useStore = create((set, get) => ({
  // --- AUTHENTICATION STATE ---
  token: localStorage.getItem('studyquest_token') || null,
  user: null,
  isAuthenticated: false,
  authLoading: true,
  authError: null,
  isAuthModalOpen: false,
  authModalRedirectPath: null,
  userRole: 'student',

  openAuthModal: (redirectPath = null) => set({ isAuthModalOpen: true, authModalRedirectPath: redirectPath }),
  closeAuthModal: () => set({ isAuthModalOpen: false, authModalRedirectPath: null }),
  setUserRole: (role) => set({ userRole: role }),

  login: async (email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response;
      localStorage.setItem('studyquest_token', token);
      set({ token, user, isAuthenticated: true, authLoading: false });
      
      // Connect WebSocket
      socketService.connect(token);
      return user;
    } catch (err) {
      set({ authError: err.message, authLoading: false });
      throw err;
    }
  },

  register: async (username, email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { token, user } = response;
      localStorage.setItem('studyquest_token', token);
      set({ token, user, isAuthenticated: true, authLoading: false });
      
      // Connect WebSocket
      socketService.connect(token);
      return user;
    } catch (err) {
      set({ authError: err.message, authLoading: false });
      throw err;
    }
  },

  loginWithGoogle: async (email, username, credential) => {
    set({ authLoading: true, authError: null });
    try {
      const response = await api.post('/auth/google', { email, username, credential });
      const { token, user } = response;
      localStorage.setItem('studyquest_token', token);
      set({ token, user, isAuthenticated: true, authLoading: false });
      
      // Connect WebSocket
      socketService.connect(token);
      return user;
    } catch (err) {
      set({ authError: err.message, authLoading: false });
      throw err;
    }
  },

  loginPasswordless: async (email) => {
    set({ authLoading: true, authError: null });
    try {
      const response = await api.post('/auth/passwordless', { email });
      const { token, user } = response;
      localStorage.setItem('studyquest_token', token);
      set({ token, user, isAuthenticated: true, authLoading: false });
      
      // Connect WebSocket
      socketService.connect(token);
      return user;
    } catch (err) {
      set({ authError: err.message, authLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('studyquest_token');
    socketService.disconnect();
    set({ token: null, user: null, isAuthenticated: false, authError: null });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false, authLoading: false });
      return;
    }
    try {
      const response = await api.get('/auth/profile');
      set({ user: response.user, isAuthenticated: true, authLoading: false });
      // Connect WebSocket
      socketService.connect(token);
    } catch (err) {
      console.error('Auth check failed:', err.message);
      localStorage.removeItem('studyquest_token');
      set({ token: null, user: null, isAuthenticated: false, authLoading: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      set({ user: response.user });
      return response.user;
    } catch (err) {
      console.error('Failed to update profile:', err.message);
      throw err;
    }
  },

  // --- QUESTS STATE ---
  quests: [],
  questsLoading: false,
  fetchQuests: async () => {
    set({ questsLoading: true });
    try {
      const response = await api.get('/quests');
      set({ quests: response.data, questsLoading: false });
    } catch (err) {
      console.error('Failed to fetch quests:', err.message);
      set({ questsLoading: false });
    }
  },

  claimQuest: async (questKey) => {
    try {
      const response = await api.post('/quests/claim', { questKey });
      // Update local user level and XP
      if (response.data) {
        set((state) => ({
          user: {
            ...state.user,
            xp: response.data.userXp,
            level: response.data.userLevel,
          }
        }));
      }
      return response.message;
    } catch (err) {
      console.error('Failed to claim quest:', err.message);
      throw err;
    }
  },

  logActivity: async (type, value) => {
    try {
      const response = await api.post('/quests/activity', { type, value });
      return response.data;
    } catch (err) {
      console.error('Failed to log activity:', err.message);
      throw err;
    }
  },

  // --- FOCUS POMODORO TIMER STATE ---
  timerStatus: 'idle', // idle, running, paused
  timerType: 'focus', // focus (50m), shortBreak (10m), longBreak (15m)
  timeLeft: 50 * 60,
  activeAudio: null, // lofi, synthwave, ambient, nature
  isMuted: false,

  setTimerType: (type) => {
    let seconds = 50 * 60;
    if (type === 'shortBreak') seconds = 10 * 60;
    if (type === 'longBreak') seconds = 15 * 60;
    set({ timerType: type, timeLeft: seconds, timerStatus: 'idle' });
  },

  tick: () => {
    const { timeLeft, timerStatus, timerType, logActivity } = get();
    if (timerStatus !== 'running') return;

    if (timeLeft <= 1) {
      // Timer finished!
      set({ timerStatus: 'idle', timeLeft: 0 });
      
      // Auto-log activity on focus complete
      if (timerType === 'focus') {
        logActivity('focus', 50).catch(err => console.error(err));
        // Award direct client XP feedback
        set((state) => {
          const newXp = (state.user?.xp || 0) + 150;
          const newLevel = Math.floor(newXp / 1000) + 1;
          return {
            user: state.user ? { ...state.user, xp: newXp, level: newLevel } : null
          };
        });
      }
      
      // Ring alarm (Audio API)
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav');
        audio.volume = 0.5;
        audio.play();
      } catch (e) {
        console.log('Audio playback blocked by browser');
      }
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  startTimer: () => set({ timerStatus: 'running' }),
  pauseTimer: () => set({ timerStatus: 'paused' }),
  resetTimer: () => {
    const { timerType } = get();
    let seconds = 50 * 60;
    if (timerType === 'shortBreak') seconds = 10 * 60;
    if (timerType === 'longBreak') seconds = 15 * 60;
    set({ timerStatus: 'idle', timeLeft: seconds });
  },

  setActiveAudio: (audio) => set({ activeAudio: audio }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  // --- DSA SHEETS PROGRESS ---
  sheetProgress: [],
  sheetsLoading: false,
  fetchSheetProgress: async (sheetType) => {
    set({ sheetsLoading: true });
    try {
      const response = await api.get(`/sheets/progress?sheetType=${sheetType}`);
      set({ sheetProgress: response.data, sheetsLoading: false });
    } catch (err) {
      console.error('Failed to fetch sheet progress:', err.message);
      set({ sheetsLoading: false });
    }
  },

  toggleProblemStatus: async (sheetType, problemId, completed) => {
    try {
      const status = completed ? 'completed' : 'todo';
      const response = await api.post('/sheets/progress', { sheetType, problemId, status });
      
      // Update user XP & Level
      if (response.userXp && response.userLevel) {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            xp: response.userXp,
            level: response.userLevel
          } : null
        }));
      }

      // Update local state list
      set((state) => {
        const updated = state.sheetProgress.filter(
          (p) => !(p.sheetType === sheetType && p.problemId === problemId)
        );
        if (completed) {
          updated.push(response.data);
        }
        return { sheetProgress: updated };
      });
      
      // Log DSA activity if completed
      if (completed) {
        get().logActivity('dsa', 1).catch(err => console.error(err));
      }
    } catch (err) {
      console.error('Failed to toggle problem status:', err.message);
      throw err;
    }
  },

  // --- DSA PROBLEMS (SANDBOX) ---
  dsaProblems: [],
  dsaProblemsLoading: false,
  activeProblem: null,
  activeProblemLoading: false,

  fetchDsaProblems: async (sheetType) => {
    set({ dsaProblemsLoading: true });
    try {
      const url = sheetType ? `/sheets/problems?sheetType=${sheetType}` : '/sheets/problems';
      const response = await api.get(url);
      set({ dsaProblems: response.data, dsaProblemsLoading: false });
    } catch (err) {
      console.error('Failed to fetch DSA problems:', err.message);
      set({ dsaProblemsLoading: false });
    }
  },

  fetchProblemDetails: async (problemId) => {
    set({ activeProblemLoading: true, activeProblem: null });
    try {
      const response = await api.get(`/sheets/problems/${problemId}`);
      set({ activeProblem: response.data, activeProblemLoading: false });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch problem details:', err.message);
      set({ activeProblemLoading: false });
      throw err;
    }
  },

  runSandboxCode: async (problemId, language, code, customInput) => {
    try {
      const response = await api.post('/sheets/problems/run', { problemId, language, code, customInput });
      return response.data;
    } catch (err) {
      console.error('Failed to run code:', err.message);
      throw err;
    }
  },

  submitSandboxCode: async (problemId, language, code) => {
    try {
      const response = await api.post('/sheets/problems/submit', { problemId, language, code });
      // Update XP if submission succeeded
      if (response.data?.xpGained && response.data?.newXp) {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            xp: response.data.newXp,
            level: response.data.newLevel,
          } : null
        }));
      }
      return response.data;
    } catch (err) {
      console.error('Failed to submit code:', err.message);
      throw err;
    }
  },

  // --- ROADMAP STATE ---
  roadmaps: [],
  roadmapsLoading: false,
  activeRoadmap: null,
  activeRoadmapLoading: false,
  roadmapProgress: [],

  fetchRoadmaps: async () => {
    set({ roadmapsLoading: true });
    try {
      const response = await api.get('/roadmaps');
      set({ roadmaps: response.data, roadmapsLoading: false });
    } catch (err) {
      console.error('Failed to fetch roadmaps:', err.message);
      set({ roadmapsLoading: false });
    }
  },

  fetchRoadmapDetails: async (roadmapId) => {
    set({ activeRoadmapLoading: true, activeRoadmap: null });
    try {
      const response = await api.get(`/roadmaps/${roadmapId}`);
      set({ activeRoadmap: response.data, activeRoadmapLoading: false });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch roadmap details:', err.message);
      set({ activeRoadmapLoading: false });
      throw err;
    }
  },

  fetchRoadmapProgress: async (roadmapId) => {
    try {
      const response = await api.get(`/roadmaps/progress?roadmapId=${roadmapId}`);
      set({ roadmapProgress: response.data });
    } catch (err) {
      console.error('Failed to fetch roadmap progress:', err.message);
    }
  },

  submitRoadmapCapstone: async (roadmapId, nodeIndex, projectUrl) => {
    try {
      const response = await api.post('/roadmaps/submit-capstone', { roadmapId, nodeIndex, projectUrl });
      // Update user XP
      if (response.newXp) {
        set((state) => ({
          user: state.user ? { ...state.user, xp: response.newXp, level: response.newLevel } : null
        }));
      }
      // Update local roadmap progress
      set({ roadmapProgress: response.data?.completedNodes ? response.data : [] });
      return response;
    } catch (err) {
      console.error('Failed to submit capstone:', err.message);
      throw err;
    }
  },

  // --- COMMUNITIES & MESSAGES STATE ---
  communities: [],
  activeCommunity: null,
  messages: [],
  communitiesLoading: false,
  messagesLoading: false,

  fetchCommunities: async () => {
    set({ communitiesLoading: true });
    try {
      const response = await api.get('/communities');
      set({ communities: response.data, communitiesLoading: false });
      // Keep activeCommunity null initially so user lands on the no-active-channel placeholder
      // if (response.data?.length > 0 && !get().activeCommunity) {
      //   get().setActiveCommunity(response.data[0]);
      // }
    } catch (err) {
      console.error('Failed to fetch communities:', err.message);
      set({ communitiesLoading: false });
    }
  },

  setActiveCommunity: async (community) => {
    const prev = get().activeCommunity;
    if (prev) {
      socketService.leaveRoom(prev._id);
    }
    set({ activeCommunity: community, messages: [] });
    if (community) {
      socketService.joinRoom(community._id);
      await get().fetchMessages(community._id);
    }
  },

  fetchMessages: async (communityId) => {
    set({ messagesLoading: true });
    try {
      const response = await api.get(`/communities/${communityId}/messages`);
      set({ messages: response.data, messagesLoading: false });
    } catch (err) {
      console.error('Failed to fetch messages:', err.message);
      set({ messagesLoading: false });
    }
  },

  addMessage: (message) => {
    const { activeCommunity, messages } = get();
    if (activeCommunity && message.communityId === activeCommunity._id) {
      // Check for duplicate messages
      if (!messages.find(m => m._id === message._id)) {
        set({ messages: [...messages, message] });
      }
    }
  },

  // --- HACKATHONS STATE ---
  hackathons: [],
  hackathonsLoading: false,
  fetchHackathons: async () => {
    set({ hackathonsLoading: true });
    try {
      const response = await api.get('/hackathons');
      set({ hackathons: response.data, hackathonsLoading: false });
    } catch (err) {
      console.error('Failed to fetch hackathons:', err.message);
      set({ hackathonsLoading: false });
    }
  },

  // --- PLATFORM TRACKER STATS ---
  trackerStats: null,
  trackerLoading: false,
  fetchTrackerStats: async () => {
    set({ trackerLoading: true });
    try {
      const response = await api.get('/trackers/stats/mockuser'); // actual endpoint uses token req.user.id
      set({ trackerStats: response.data, trackerLoading: false });
      if (response.data?.currentLevel && response.data?.xpGained) {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            xp: response.data.xpGained,
            level: response.data.currentLevel,
          } : null
        }));
      }
    } catch (err) {
      console.error('Failed to fetch tracker stats:', err.message);
      set({ trackerLoading: false });
    }
  }
}));
