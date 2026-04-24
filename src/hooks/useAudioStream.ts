import { useState, useRef, useCallback, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { LiveSession } from '@/types';

export type TranscriptEntry = {
  id: string;
  transcript: string;
  speaker?: string;
  session_id?: string | null;
  ts?: string | number;
};

export const useAudioStream = (token: string | null) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [attendance, setAttendance] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);

  const socketRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const transcriptBufferRef = useRef<TranscriptEntry[]>([]);
  const flushTimeoutRef = useRef<number | null>(null);
  const liveSessionIdRef = useRef<string | null>(null);

  const flushTranscriptBuffer = useCallback(() => {
    if (flushTimeoutRef.current) {
      window.clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }

    if (transcriptBufferRef.current.length === 0) return;

    const buffered = transcriptBufferRef.current;
    transcriptBufferRef.current = [];

    setTranscripts((prev) => {
      const next = [...prev, ...buffered];
      return next.length > 250 ? next.slice(next.length - 250) : next;
    });
  }, []);

  useEffect(() => {
    liveSessionIdRef.current = liveSession?.session_id ?? null;
  }, [liveSession?.session_id]);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onConnectionConfirmed = (data: any) => {
      if (data.live_session?.active) {
        setLiveSession(data.live_session);
        socket.emit('join_live_session', { session_id: data.live_session.session_id });
      }
    };

    const onStatusUpdate = (data: any) => {
        // Newer backend shape: { is_active, session_id, ... }
        if (typeof data?.is_active === 'boolean') {
          setIsRecording(data.is_active);
          if (!data.is_active) {
            setLiveSession(null);
            setAttendance([]);
            setTranscript('');
            setTranscripts([]);
          }
        }

        if (data?.session_id && typeof data.session_id === 'string') {
          setLiveSession((prev) => ({
            ...(prev || { session_id: data.session_id, title: 'Live Lecture', course: 'General' }),
            session_id: data.session_id,
            active: data?.is_active ?? true,
          }));
        }

        if (data.live_session) {
          setLiveSession(data.live_session);
        }
        if (typeof data.streaming === 'boolean') {
          setIsRecording(data.streaming);
          if (!data.streaming) {
            setLiveSession(null);
            setAttendance([]);
            setTranscript('');
            setTranscripts([]);
          }
        }
      };

    const onInsightReceived = (data: any) => {
        const transcriptText = data?.data?.transcript;
        if (!transcriptText || typeof transcriptText !== 'string') return;

        const entry: TranscriptEntry = {
          id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
          transcript: transcriptText,
          speaker: typeof data?.data?.speaker === 'string' ? data.data.speaker : undefined,
          session_id:
            typeof data?.data?.session_id === 'string'
              ? data.data.session_id
              : liveSessionIdRef.current,
          ts: data?.data?.ts,
        };

        setTranscript(transcriptText);
        transcriptBufferRef.current.push(entry);

        // Batch UI updates to avoid re-rendering on every chunk.
        if (!flushTimeoutRef.current) {
          flushTimeoutRef.current = window.setTimeout(flushTranscriptBuffer, 200);
        }
      };

    const onAttendanceUpdate = (data: any) => {
      const present = data?.present_students;
      if (Array.isArray(present)) {
        setAttendance(present.filter((id) => typeof id === 'string'));
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connection_confirmed', onConnectionConfirmed);
    socket.on('status_update', onStatusUpdate);
    socket.on('insight_received', onInsightReceived);
    socket.on('attendance_update', onAttendanceUpdate);

    // Ensure backend sends initial status even if socket was already connected.
    socket.emit('connected', { ts: Date.now() });
    socket.emit('get_status', {});

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connection_confirmed', onConnectionConfirmed);
      socket.off('status_update', onStatusUpdate);
      socket.off('insight_received', onInsightReceived);
      socket.off('attendance_update', onAttendanceUpdate);

      if (flushTimeoutRef.current) {
        window.clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }
    };
  }, [token, flushTranscriptBuffer]);

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
      // Keep the processor alive without routing audio to speakers.
      const zeroGain = audioContext.createGain();
      zeroGain.gain.value = 0;
      processor.connect(zeroGain);
      zeroGain.connect(audioContext.destination);

      // Start the live session; backend will reflect state via status_update
      setIsRecording(true);
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

    // Stop the live session; request status sync from backend
    if (socketRef.current) {
      socketRef.current.emit('stop_stream');
      socketRef.current.emit('get_status');
    }

    setIsRecording(false);
    setTranscript('');
    setTranscripts([]);
    setAttendance([]);
  }, []);

  const joinLiveSession = useCallback((options: { sessionId?: string; studentId?: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('join_live_session', {
        session_id: options.sessionId,
        student_id: options.studentId,
      });
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
    transcripts,
    attendance,
    isConnected,
    liveSession,
    startRecording,
    stopRecording,
    joinLiveSession,
    leaveLiveSession,
  };
};
