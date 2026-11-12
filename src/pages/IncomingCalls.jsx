import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { io } from 'socket.io-client';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export default function IncomingCalls() {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [answeredBy, setAnsweredBy] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const localAudioTrack = useRef(null);
  const ringtoneRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    ringtoneRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    ringtoneRef.current.loop = true;

    // Connect to Socket.io
    socketRef.current = io('https://gas-mtaani-backend.onrender.com');

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_admin_room');
    });

    socketRef.current.on('incoming_call', (data) => {
      setIncomingCall(data);
      setAnsweredBy(null);
      ringtoneRef.current.play().catch(e => console.log('Audio blocked', e));
    });

    socketRef.current.on('call_answered_by_other', (data) => {
      setIncomingCall(null);
      ringtoneRef.current.pause(); 
      setAnsweredBy(data.adminName);
      setTimeout(() => setAnsweredBy(null), 4000);
    });

    return () => {
      socketRef.current.disconnect();
      if (ringtoneRef.current) ringtoneRef.current.pause();
    };
  }, []);

  const handleAnswer = async (callId) => {
    ringtoneRef.current.pause();
    setIncomingCall(null);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`https://gas-mtaani-backend.onrender.com/api/agora/support-calls/${callId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error || 'Failed to answer');

      await client.join(data.app_id, data.channel_name, data.token, null);
      localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish([localAudioTrack.current]);

      setActiveCall({ callId, channelName: data.channel_name });

    } catch (err) {
      alert(`Error answering: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;
    setLoading(true);
    try {
      if (localAudioTrack.current) {
        localAudioTrack.current.stop();
        localAudioTrack.current.close();
      }
      await client.leave();

      const token = localStorage.getItem('admin_token');
      await fetch(`https://gas-mtaani-backend.onrender.com/api/agora/support-calls/${activeCall.callId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      setActiveCall(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-bold mb-4">🎧 Support Call Center</h2>

      {activeCall && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-green-800 font-bold">Call in progress...</p>
            <p className="text-sm text-green-600">You are connected to the customer.</p>
          </div>
          <button onClick={handleEndCall} disabled={loading} className="bg-red-500 text-white px-6 py-2 rounded font-bold">
            End Call
          </button>
        </div>
      )}

      {!activeCall && incomingCall && (
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg animate-pulse flex justify-between items-center">
          <div>
            <p className="font-bold text-lg">{incomingCall.callerName}</p>
            <p className="text-sm text-gray-600">Incoming {incomingCall.callerType} call...</p>
          </div>
          <button onClick={() => handleAnswer(incomingCall.callId)} className="bg-green-500 text-white px-6 py-2 rounded font-bold">
            📞 Answer
          </button>
        </div>
      )}

      {!activeCall && answeredBy && (
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg text-center">
          <p className="text-gray-700 font-medium">
            ☎️ Call answered by <span className="font-bold text-gray-900">{answeredBy}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Returning to waiting mode...</p>
        </div>
      )}

      {!activeCall && !incomingCall && !answeredBy && (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">Waiting for incoming calls...</p>
        </div>
      )}
    </div>
  );
}