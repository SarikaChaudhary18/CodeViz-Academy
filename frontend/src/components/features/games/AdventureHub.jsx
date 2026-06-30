import React, { useState, useEffect } from 'react';
import { Gamepad2, Swords, Target, Sparkles, Key, ChevronRight, Award, RefreshCw, X, CheckCircle, Trophy } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { socketService } from '../../../lib/socket';

const GAME_CARDS = [
  {
    title: "Multiverse Code Battle",
    desc: "Speed-compile algorithms against online peers or bots.",
    icon: Swords
  },
  {
    title: "Bug Hunt Arena",
    desc: "Scan code segments to target semantic compiler faults.",
    icon: Target
  },
  {
    title: "Algorithm Speed Race",
    desc: "Race against a ticking timer to parse complexity logs.",
    icon: Sparkles
  },
  {
    title: "Algorithmic Escape Room",
    desc: "Solve programming riddles to unlock the kernel exit doors.",
    icon: Key
  }
];

export default function AdventureHub() {
  const user = useStore(state => state.user);
  const [matchmaking, setMatchmaking] = useState(false);
  const [matchRoom, setMatchRoom] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [activeGame, setActiveGame] = useState(null); // { question, yourCode, peerCode, winner }

  // Game Battle code variables
  const [codeValue, setCodeValue] = useState(`function reverseString(str) {\n  // Type code here\n  return str;\n}`);
  const [peerCode, setPeerCode] = useState('');
  const [gameLogs, setGameLogs] = useState([]);
  const [battleFinished, setBattleFinished] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (socket) {
      // Listen for match findings
      const unsubscribeMatch = socketService.onMatchFound((data) => {
        setMatchmaking(false);
        setMatchRoom(data.matchRoomId);
        setOpponent(data.opponent);
        
        // Initialize Game Battle Arena
        setActiveGame({
          question: "Write a function 'reverseString(str)' that returns the string reversed. Example: reverseString('hello') should return 'olleh'.",
          yourCode: `function reverseString(str) {\n  // Type code here\n  return str;\n}`,
          peerCode: `// Opponent is coding...`
        });
        setCodeValue(`function reverseString(str) {\n  // Type code here\n  return str;\n}`);
        setPeerCode(`// Opponent is coding...`);
        setGameLogs(["Match found! Battle initialized."]);
        setBattleFinished(false);
        setWinner(null);
      });

      // Listen for real-time game updates
      const unsubscribeGameEvent = socketService.onGameEventReceived((data) => {
        if (data.eventType === 'code_update') {
          setPeerCode(data.payload.code);
        } else if (data.eventType === 'completed') {
          setWinner(data.sender);
          setBattleFinished(true);
          setGameLogs(prev => [...prev, `🏆 ${data.sender} submitted a working solution first!`]);
        }
      });

      return () => {
        unsubscribeMatch();
        unsubscribeGameEvent();
      };
    }
  }, []);

  const handleStartMatchmaking = () => {
    setMatchmaking(true);
    socketService.joinMatchmaking(user?.level || 1);
  };

  const handleCancelMatchmaking = () => {
    setMatchmaking(false);
    socketService.leaveMatchmaking();
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCodeValue(val);
    if (matchRoom) {
      socketService.emitGameEvent(matchRoom, 'code_update', { code: val });
    }
  };

  const handleSubmitSolution = () => {
    if (!matchRoom || battleFinished) return;
    setWinner('You');
    setBattleFinished(true);
    setGameLogs(prev => [...prev, "🎉 You successfully completed the challenge first!"]);
    socketService.emitGameEvent(matchRoom, 'completed', {});
  };

  const handleExitGame = () => {
    setMatchRoom(null);
    setOpponent(null);
    setActiveGame(null);
    setWinner(null);
    setBattleFinished(false);
  };

  if (activeGame) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 text-left">
        {/* Battle Arena Header */}
        <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
              <Swords className="text-orange-600 animate-bounce" />
              CODE BATTLE ARENA
            </h1>
            <p className="text-xs text-zinc-500 font-mono">
              Opponent: <span className="text-orange-600 font-bold">{opponent?.name || 'Peer'}</span> (Level {opponent?.level || 1})
            </p>
          </div>

          <button
            onClick={handleExitGame}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-xs font-mono font-bold text-zinc-700 rounded-lg cursor-pointer"
          >
            Leave Arena
          </button>
        </div>

        {/* Battle grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question panel */}
          <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-mono font-bold text-zinc-950 uppercase tracking-wider pb-2 border-b border-zinc-100">
              Coding Challenge
            </h3>
            <p className="text-xs text-zinc-755 leading-relaxed bg-zinc-50 p-4 border border-zinc-150 rounded-xl font-mono">
              {activeGame.question}
            </p>

            <div className="space-y-2">
              <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Logs Feed</h4>
              <div className="max-h-36 overflow-y-auto p-3 bg-zinc-950 rounded-xl font-mono text-[9px] text-zinc-300 space-y-1">
                {gameLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            </div>

            {battleFinished && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3">
                <Trophy className="text-orange-600 shrink-0" size={24} />
                <div>
                  <h4 className="text-xs font-bold text-orange-950">Challenge Complete!</h4>
                  <p className="text-[10px] text-zinc-600 font-mono">
                    Winner: <span className="font-bold text-orange-600">{winner}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Editors workspace (Your code & opponent code) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Workspace */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <span className="text-[10px] font-mono font-bold text-zinc-950">YOUR CODE</span>
                <span className="text-[8px] font-mono text-zinc-400 uppercase">You (Lvl {user?.level || 1})</span>
              </div>
              <textarea
                value={codeValue}
                onChange={handleCodeChange}
                disabled={battleFinished}
                className="w-full h-64 p-3 font-mono text-xs border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-500 bg-zinc-50 text-zinc-900 leading-relaxed"
              />
              <button
                onClick={handleSubmitSolution}
                disabled={battleFinished}
                className="w-full py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-100 disabled:text-zinc-400 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
              >
                Submit Solution
              </button>
            </div>

            {/* Opponent Workspace */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <span className="text-[10px] font-mono font-bold text-zinc-950">OPPONENT WORKSPACE</span>
                <span className="text-[8px] font-mono text-orange-600 uppercase font-bold">{opponent?.name}</span>
              </div>
              <textarea
                value={peerCode}
                disabled
                className="w-full h-72 p-3 font-mono text-xs border border-zinc-200 rounded-xl bg-zinc-100 text-zinc-500 leading-relaxed cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
            <Gamepad2 className="text-orange-600 w-8 h-8 animate-pulse" />
            ADVENTURE GAMING HUB
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Validate computer science principles through gamified socket code-battles
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-full">
          <Award size={14} />
          <span>Profile Level: {user?.level || 1}</span>
        </div>
      </div>

      {/* Matchmaking Lobby Actions */}
      <div className="p-6 bg-orange-50/40 border border-orange-100 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-zinc-950 tracking-tight">Real-Time Multiplayer Matchmaker</h2>
          <p className="text-xs text-zinc-650 leading-relaxed">
            Queue up to match with other active WebSocket peers. Race to solve algorithm challenges.
          </p>
        </div>

        {!matchmaking ? (
          <button
            onClick={handleStartMatchmaking}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md cursor-pointer shrink-0"
          >
            Find Random Match <Swords size={14} />
          </button>
        ) : (
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-mono text-zinc-600 flex items-center gap-2 animate-pulse shadow-sm">
              <RefreshCw size={14} className="animate-spin text-orange-600" /> Searching for peers...
            </div>
            <button
              onClick={handleCancelMatchmaking}
              className="p-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl text-zinc-400 hover:text-zinc-650 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Grid of games */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GAME_CARDS.map((game, index) => {
          const Icon = game.icon;
          return (
            <div 
              key={index}
              className="bg-white border border-zinc-200 hover:border-orange-250 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all text-left"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-extrabold text-zinc-950 tracking-tight">{game.title}</h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{game.desc}</p>
              </div>

              <button
                onClick={handleStartMatchmaking}
                className="mt-6 flex items-center gap-1.5 text-xs font-mono font-bold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
              >
                Queue Matchmaking <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
