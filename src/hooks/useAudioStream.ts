import { useState, useRef, useCallback, useEffect } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { LiveSession } from '@/types';

export const useAudioStream = (token: string | null) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [canStream, setCanStream] = useState(false);

  const socketRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (token) {
      socketRef.current = getSocket(token);

      socketRef.current.on('connect', () => setIsConnected(true));
      socketRef.current.on('disconnect', () => setIsConnected(false));

      socketRef.current.on('connected', (data: any) => {
        if (data.live_session?.active) {
          setLiveSession(data.live_session);
          socketRef.current.emit('join_live_session', { session_id: data.live_session.session_id });
        }
      });

      socketRef.current.on('system', (data: any) => {
        if (data.type === 'streaming_started') {
          setLiveSession(data);
          setIsRecording(true);
        } else if (data.type === 'streaming_stopped') {
          setIsRecording(false);
          setLiveSession(null);
        } else if (data.type === 'joined_live_session') {
          setLiveSession(data);
        }
      });

      socketRef.current.on('insight', (data: any) => {
        if (data.data?.transcript) {
          setTranscript(data.data.transcript);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connected');
        socketRef.current.off('system');
        socketRef.current.off('insight');
      }
    };
  }, [token]);

  const startRecording = useCallback(async (title: string = 'Live Lecture', course: string = 'General') => {
    if (!token || !socketRef.current) return;

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // Create audio context for resampling
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      await audioContext.resume();

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);

        // Resample to 16kHz (backend expects this)
        const ratio = audioContext.sampleRate / 16000;
        const outputLength = Math.floor(inputData.length / ratio);
        const outputData = new Float32Array(outputLength);

        for (let i = 0; i < outputLength; i++) {
          outputData[i] = inputData[Math.floor(i * ratio)];
        }

        // Convert to 16-bit PCM
        const pcm16 = new Int16Array(outputData.length);
        for (let i = 0; i < outputData.length; i++) {
          const s = Math.max(-1, Math.min(1, outputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Send to backend
        socketRef.current.emit('audio_chunk', pcm16.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Start the live session
      socketRef.current.emit('start_stream', { title, course });

    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, [token]);

  const stopRecording = useCallback(() => {
    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    // Stop the live session
    if (socketRef.current) {
      socketRef.current.emit('stop_stream');
    }

    setIsRecording(false);
    setTranscript('');
  }, []);

  const joinLiveSession = useCallback((sessionId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_live_session', { session_id: sessionId });
    }
  }, []);

  const leaveLiveSession = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave_live_session');
    }
    setLiveSession(null);
    setTranscript('');
  }, []);

  return {
    isRecording,
    transcript,
    isConnected,
    liveSession,
    canStream,
    startRecording,
    stopRecording,
    joinLiveSession,
    leaveLiveSession,
  };
};