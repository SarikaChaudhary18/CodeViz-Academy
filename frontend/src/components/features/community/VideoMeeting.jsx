import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Video, VideoOff, Mic, MicOff, Monitor, PhoneOff, Users, Phone, PhoneIncoming, X, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../hooks/useStore';
import { socketService } from '../../../lib/socket';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function VideoMeeting() {
  const { user, peers, fetchPeers, peersLoading } = useStore();

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [callState, setCallState] = useState('idle'); // idle | calling | incoming | connected
  const [incomingCall, setIncomingCall] = useState(null); // { callerId, callerName, socketId }
  const [peerSocketId, setPeerSocketId] = useState(null);
  const [peerName, setPeerName] = useState('');
  const [connectedPeers, setConnectedPeers] = useState([]); // friends to call
  const [callError, setCallError] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const pcRef = useRef(null); // RTCPeerConnection

  // Auto-start camera preview on mount
  useEffect(() => {
    startPreview();
    return () => {
      // Cleanup stream on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

  useEffect(() => {
    // Show ALL registered users — call anyone, not just friends
    setConnectedPeers(peers);
  }, [peers]);

  // Register socket listeners
  useEffect(() => {
    const cleanupIncoming = socketService.onIncomingCall((data) => {
      setIncomingCall(data);
      setCallState('incoming');
    });

    const cleanupAccepted = socketService.onCallAccepted(async (data) => {
      setPeerSocketId(data.answererSocketId);
      setPeerName(data.answererName);
      // As caller: create offer now that call is accepted
      await createAndSendOffer(data.answererSocketId);
    });

    const cleanupRejected = socketService.onCallRejected(() => {
      setCallError('Call was declined.');
      setCallState('idle');
      cleanupCall();
    });

    const cleanupEnded = socketService.onCallEnded(() => {
      setCallState('idle');
      cleanupCall();
    });

    const cleanupOffer = socketService.onWebRTCOffer(async ({ offer, senderSocketId }) => {
      // As callee: receive offer, set remote desc, create answer
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketService.sendAnswer(senderSocketId, answer);
    });

    const cleanupAnswer = socketService.onWebRTCAnswer(async ({ answer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    const cleanupIce = socketService.onIceCandidate(async ({ candidate }) => {
      if (!pcRef.current || !candidate) return;
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('ICE candidate error:', e);
      }
    });

    return () => {
      cleanupIncoming();
      cleanupAccepted();
      cleanupRejected();
      cleanupEnded();
      cleanupOffer();
      cleanupAnswer();
      cleanupIce();
    };
  }, []);

  const startPreview = async () => {
    // If already have a stream, just attach it
    if (localStreamRef.current) {
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      return localStreamRef.current;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCallError('');
      return stream;
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setCallError('Camera/mic access denied. Please allow permissions in your browser and refresh.');
      } else if (err.name === 'NotFoundError') {
        setCallError('No camera/mic found. Please connect a device.');
      } else {
        setCallError('Could not access camera: ' + err.message);
      }
      return null;
    }
  };

  const getLocalStream = async () => {
    return await startPreview();
  };

  const createPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Add local tracks
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // On remote track received
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setCallState('connected');
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && peerSocketId) {
        socketService.sendIceCandidate(peerSocketId, event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setCallState('idle');
        cleanupCall();
      }
    };

    return pc;
  };

  const createAndSendOffer = async (targetSocketId) => {
    if (!pcRef.current) return;
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socketService.sendOffer(targetSocketId, offer);
  };

  const startCall = async (peer) => {
    setCallError('');
    try {
      // Reuse existing preview stream or start one
      const stream = await startPreview();
      if (!stream) return; // permission denied
      createPeerConnection(stream);

      setPeerName(peer.name);
      setCallState('calling');

      socketService.requestCall(peer.id, user?.username, user?.id);
    } catch (err) {
      console.error('Failed to start call:', err);
    }
  };

  const acceptIncomingCall = async () => {
    setCallError('');
    try {
      const stream = await startPreview();
      if (!stream) return;
      const pc = createPeerConnection(stream);
      setPeerSocketId(incomingCall.socketId);
      setPeerName(incomingCall.callerName);

      socketService.acceptCall(incomingCall.socketId);
      setCallState('connected');
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to accept call:', err);
    }
  };

  const rejectIncomingCall = () => {
    if (incomingCall) {
      socketService.rejectCall(incomingCall.socketId);
    }
    setIncomingCall(null);
    setCallState('idle');
  };

  const hangUp = () => {
    if (peerSocketId) {
      socketService.endCall(peerSocketId);
    }
    setCallState('idle');
    cleanupCall();
  };

  const cleanupCall = () => {
    // Stop only if there's a peer connection (keep preview stream alive)
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setPeerSocketId(null);
    setPeerName('');
    setIncomingCall(null);
    setScreenShare(false);
    // Re-attach local preview
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setMicOn(prev => !prev);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setVideoOn(prev => !prev);
  };

  const toggleScreenShare = async () => {
    if (screenShare) {
      // Stop screen sharing, revert to camera
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = cameraStream.getVideoTracks()[0];
        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) await sender.replaceTrack(videoTrack);
        }
        if (localVideoRef.current) localVideoRef.current.srcObject = cameraStream;
        setScreenShare(false);
      } catch (e) { console.error(e); }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) await sender.replaceTrack(screenTrack);
        }
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        screenTrack.onended = () => setScreenShare(false);
        setScreenShare(true);
      } catch (e) {
        if (e.name !== 'NotAllowedError') console.error(e);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 flex items-center gap-2">
          <Video className="text-orange-600 w-8 h-8" />
          LIVE VIDEO CALLING
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
          WebRTC peer-to-peer video calls with connected friends
        </p>
      </div>

      {/* Incoming Call Notification */}
      <AnimatePresence>
        {callState === 'incoming' && incomingCall && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">
                <PhoneIncoming className="text-orange-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">Incoming Video Call</p>
                <p className="text-xs text-zinc-600 font-mono mt-0.5">{incomingCall.callerName} is calling you...</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={acceptIncomingCall}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow"
              >
                <Phone size={14} /> Accept
              </button>
              <button
                onClick={rejectIncomingCall}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow"
              >
                <PhoneOff size={14} /> Decline
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Banner */}
      {callError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-mono flex items-center justify-between">
          <span>{callError}</span>
          <button onClick={() => setCallError('')} className="ml-4 cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* Main Video Area */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Local Video */}
          <div className="relative aspect-video rounded-2xl bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {!videoOn && (
              <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
                <VideoOff size={24} className="text-zinc-500" />
              </div>
            )}
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 text-white">
              <span>{user?.username || 'You'}</span>
              {!micOn && <MicOff size={10} className="text-red-400" />}
            </div>
            {callState === 'calling' && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500 rounded-lg text-[8px] font-mono font-bold text-white animate-pulse">
                CALLING...
              </div>
            )}
            {callState === 'connected' && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-green-600 rounded-lg text-[8px] font-mono font-bold text-white animate-pulse">
                LIVE
              </div>
            )}
            {callState === 'idle' && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-zinc-800/80 rounded-lg text-[8px] font-mono text-zinc-400">
                PREVIEW
              </div>
            )}
          </div>

          {/* Remote Video */}
          <div className="relative aspect-video rounded-2xl bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {callState !== 'connected' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 gap-3">
                {callState === 'calling' ? (
                  <>
                    <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-lg font-bold text-white uppercase">{peerName.charAt(0)}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase animate-pulse">Ringing {peerName}...</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={28} className="text-zinc-600" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Remote stream inactive</span>
                  </>
                )}
              </div>
            )}
            {callState === 'connected' && (
              <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-mono font-bold text-white">
                {peerName}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-zinc-150 pt-6">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              micOn
                ? 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200'
                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            }`}
            title={micOn ? 'Mute Mic' : 'Unmute Mic'}
          >
            {micOn ? <Mic size={16} /> : <MicOff size={16} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              videoOn
                ? 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200'
                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            }`}
            title={videoOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {videoOn ? <Video size={16} /> : <VideoOff size={16} />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              screenShare
                ? 'bg-orange-600 border-orange-500 text-white hover:bg-orange-500'
                : 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200'
            }`}
            title={screenShare ? 'Stop Screen Share' : 'Share Screen'}
          >
            <Monitor size={16} />
          </button>

          {(callState === 'calling' || callState === 'connected') && (
            <button
              onClick={hangUp}
              className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer border border-red-500/20 flex items-center gap-2 px-5"
              title="End Call"
            >
              <PhoneOff size={16} />
              <span className="text-xs font-bold font-mono">End Call</span>
            </button>
          )}
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
          <Wifi size={11} className={callState === 'connected' ? 'text-green-500' : 'text-zinc-300'} />
          <span>
            {callState === 'idle' && 'Ready — Select a friend below to call'}
            {callState === 'calling' && `Calling ${peerName}...`}
            {callState === 'incoming' && `Incoming call from ${incomingCall?.callerName}`}
            {callState === 'connected' && `Connected with ${peerName} • WebRTC P2P`}
          </span>
        </div>
      </div>

      {/* Connected Friends — Who Can Be Called */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Users className="text-orange-600 w-5 h-5" />
          <h2 className="text-sm font-bold text-zinc-900 font-mono uppercase tracking-wide">Call Anyone</h2>
          <span className="text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold font-mono">
            {connectedPeers.length} User{connectedPeers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {peersLoading ? (
          <div className="text-center py-8 text-[10px] font-mono text-zinc-400 uppercase animate-pulse">
            Loading users...
          </div>
        ) : connectedPeers.length === 0 ? (
          <div className="text-center py-10 text-zinc-400">
            <Users size={28} className="mx-auto mb-3 text-zinc-300" />
            <p className="text-xs font-mono uppercase tracking-widest">No other users registered yet</p>
            <p className="text-[10px] text-zinc-400 mt-1">Invite friends to join and call them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedPeers.map((peer) => (
              <div
                key={peer.id}
                className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl p-3 hover:border-orange-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center font-bold text-sm text-orange-600 uppercase">
                    {peer.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">{peer.name}</p>
                    <p className="text-[9px] text-zinc-500 font-mono">Level {peer.level} • {peer.xp} XP</p>
                  </div>
                </div>
                <button
                  onClick={() => startCall(peer)}
                  disabled={callState !== 'idle'}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer"
                >
                  <Video size={12} /> Call
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
