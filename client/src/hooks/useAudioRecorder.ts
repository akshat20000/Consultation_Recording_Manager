import { useState, useRef, useEffect } from 'react';

export interface UseAudioRecorderResult {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number; // in seconds
  audioBlob: Blob | null;
  audioUrl: string | null;
  analyser: AnalyserNode | null;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  clearAudio: () => void;
  error: string | null;
}

export const useAudioRecorder = (): UseAudioRecorderResult => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  const startRecording = async () => {
    setError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    chunksRef.current = [];
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup Web Audio API Analyser for Waveform
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const audioAnalyser = audioContext.createAnalyser();
      audioAnalyser.fftSize = 256;
      source.connect(audioAnalyser);
      setAnalyser(audioAnalyser);

      // Setup MediaRecorder
      const options = { mimeType: 'audio/webm' };
      let recorder: MediaRecorder;
      
      try {
        recorder = new MediaRecorder(stream, options);
      } catch {
        // Fallback if webm is not supported (e.g. Safari)
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
        setIsPaused(false);
      };

      recorder.start(250); // Collect data chunks every 250ms
      setIsRecording(true);
      setIsPaused(false);

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('[Recorder Error] Access denied or device occupied:', err);
      setError(err.message || 'Microphone access denied or not found');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume elapsed timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      cleanup();
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  return {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    analyser,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearAudio,
    error,
  };
};
