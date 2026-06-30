import React, { useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Monitor, PhoneOff, Users, Award, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoMeeting() {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Video className="text-orange-600 w-8 h-8" />
          VIDEO & AUDIO MEETING ROOM
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          Coordinate peer mock sprints and dynamic whiteboarding over video nodes
        </p>
      </div>

      {/* Main video area */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Conference Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* User Video */}
          <div className="relative aspect-video rounded-2xl bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center text-white">
            {videoOn ? (
              <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-orange-500 bg-zinc-950">
                [LIVE VIDEO CONTAINER - YOU]
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                  <VideoOff size={20} />
                </div>
                <span className="text-[10px] font-mono text-zinc-400 block">Video Feed Blocked</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-mono font-bold flex items-center gap-1">
              <span>You</span>
              {!micOn && <MicOff size={10} className="text-red-500" />}
            </div>
          </div>

          {/* Peer Video */}
          <div className="relative aspect-video rounded-2xl bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center text-white">
            <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-orange-500 bg-zinc-950">
              [LIVE VIDEO CONTAINER - MOHIT MUDGIL]
            </div>
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-mono font-bold">
              <span>Mohit Mudgil</span>
            </div>
          </div>

        </div>

        {/* Video Toolbar controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-zinc-150 pt-6">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              micOn 
                ? 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200' 
                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            }`}
          >
            {micOn ? <Mic size={16} /> : <MicOff size={16} />}
          </button>

          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              videoOn 
                ? 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200' 
                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            }`}
          >
            {videoOn ? <Video size={16} /> : <VideoOff size={16} />}
          </button>

          <button
            onClick={() => setScreenShare(!screenShare)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              screenShare 
                ? 'bg-orange-600 border-orange-500 text-white hover:bg-orange-500' 
                : 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200'
            }`}
            title="Share Screen"
          >
            <Monitor size={16} />
          </button>

          <button
            className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer border border-red-500/20"
            title="Leave Meeting"
          >
            <PhoneOff size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
