import React, { useEffect, useRef } from 'react';
import type { UseAudioRecorderResult } from '../../hooks/useAudioRecorder';
import { Mic, Pause, Play, Square, AlertCircle, RefreshCw } from 'lucide-react';

interface AudioRecorderProps {
  recorder: UseAudioRecorderResult;
  clientName: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ recorder, clientName }) => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    error,
    analyser,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearAudio,
    audioBlob,
  } = recorder;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Format time (mm:ss)
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Canvas Web Audio Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser ? analyser.frequencyBinCount : 0;
    const dataArray = analyser ? new Uint8Array(bufferLength) : null;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Request next frame
      animationRef.current = requestAnimationFrame(draw);

      ctx.clearRect(0, 0, width, height);

      // Gradient for bars
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#a855f7'); // Purple
      gradient.addColorStop(1, '#6366f1'); // Indigo

      if (isRecording && !isPaused && analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          // Calculate height based on amplitude
          const percent = dataArray[i] / 255;
          const barHeight = height * percent * 0.8;

          ctx.fillStyle = gradient;
          // Center the bars vertically
          ctx.fillRect(x, (height - barHeight) / 2, barWidth - 2, barHeight);

          x += barWidth;
        }
      } else {
        // Draw flat/subtle idle waves
        ctx.strokeStyle = '#334155'; // Slate 700
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const points = 80;
        const sliceWidth = width / points;
        let x = 0;

        for (let i = 0; i < points; i++) {
          const y = height / 2 + (isPaused ? Math.sin(i * 0.15) * 4 : Math.sin(i * 0.05) * 2);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, isPaused, analyser]);

  return (
    <div className="glass-panel p-8 flex flex-col items-center justify-center border-slate-800/80 bg-slate-900/40 relative overflow-hidden">
      {/* Astrological background element */}
      <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full bg-astrology-600/10 blur-xl"></div>
      <div className="absolute bottom-[-30px] left-[-30px] w-24 h-24 rounded-full bg-indigo-600/10 blur-xl"></div>

      <div className="text-center mb-6">
        <span className="text-[10px] tracking-widest uppercase font-semibold text-astrology-400">
          Recording Hub
        </span>
        <h3 className="text-xl font-bold text-slate-100 mt-1">
          {clientName ? `Session with ${clientName}` : 'Astrology Session'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {isRecording ? (isPaused ? 'Recording paused' : 'Capturing audio frequencies...') : 'Ready to record'}
        </p>
      </div>

      {/* Visual Waveform Canvas */}
      <div className="w-full max-w-lg h-24 bg-slate-950/80 rounded-2xl border border-slate-850 flex items-center justify-center p-2 mb-8 relative">
        <canvas ref={canvasRef} width="400" height="96" className="w-full h-full rounded-xl" />
        
        {/* Floating Timer Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 text-xs font-mono font-bold rounded-lg bg-slate-900 border border-slate-800 text-accent-gold shadow-lg shadow-black/20">
          {formatTime(recordingTime)}
        </div>
      </div>

      {/* Micro-animations and recording stats */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-450 p-4 rounded-xl flex items-center gap-2.5 max-w-md mb-6 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-6">
        {!isRecording && !audioBlob ? (
          <button
            onClick={startRecording}
            className="h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-tr from-rose-600 to-astrology-600 hover:from-rose-500 hover:to-astrology-500 text-white shadow-xl shadow-astrology-950/50 hover:scale-105 active:scale-95 transition-all duration-200"
            title="Start Recording"
          >
            <Mic className="h-7 w-7 text-white" />
          </button>
        ) : (
          <>
            {isRecording && (
              <>
                {isPaused ? (
                  <button
                    onClick={resumeRecording}
                    className="h-12 w-12 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:scale-105 active:scale-95"
                    title="Resume Recording"
                  >
                    <Play className="h-5 w-5 text-accent-gold" />
                  </button>
                ) : (
                  <button
                    onClick={pauseRecording}
                    className="h-12 w-12 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:scale-105 active:scale-95"
                    title="Pause Recording"
                  >
                    <Pause className="h-5 w-5 text-slate-350" />
                  </button>
                )}

                <button
                  onClick={stopRecording}
                  className="h-16 w-16 rounded-full flex items-center justify-center bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-950/30 hover:scale-105 active:scale-95 transition-all duration-200"
                  title="Stop and Save"
                >
                  <Square className="h-6 w-6 text-white" />
                </button>
              </>
            )}

            {audioBlob && (
              <button
                onClick={clearAudio}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Record Again
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default AudioRecorder;
