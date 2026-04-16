import { useState, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

export const useAudioStream = (token: string | null) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<any>(null);

  const startRecording = useCallback(async () => {
    if (!token) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      socketRef.current = getSocket(token);
      socketRef.current.emit('start_stream');

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            const int16Array = new Int16Array(arrayBuffer);
            socketRef.current.emit('audio_chunk', int16Array);
          };
          reader.readAsArrayBuffer(event.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      socketRef.current.on('insight', (data: { transcript: string }) => {
        setTranscript(data.transcript);
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [token]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);

      if (socketRef.current) {
        socketRef.current.emit('stop_stream');
      }
    }
  }, [isRecording]);

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
  };
};