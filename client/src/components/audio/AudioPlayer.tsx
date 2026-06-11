import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Sync volume & mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Formatter (mm:ss)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Construct absolute src url if it's a local fallback path
  const finalSrc = src.startsWith('/uploads/') ? `http://localhost:5000${src}` : src;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl w-full">
      <audio
        ref={audioRef}
        src={finalSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Progress timeline */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        {/* Custom Seek range */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-astrology-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Play control */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPause}
            className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-astrology-600 to-indigo-600 hover:from-astrology-500 hover:to-indigo-500 text-white shadow-lg shadow-astrology-950/45 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-white" fill="white" />
            ) : (
              <Play className="h-5 w-5 text-white translate-x-0.5" fill="white" />
            )}
          </button>

          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Playback Rate</p>
            <div className="flex gap-1.5 mt-1">
              {[1, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`text-xs px-2.5 py-1 rounded-md font-semibold border transition-all ${
                    playbackRate === speed
                      ? 'bg-astrology-600/20 text-astrology-400 border-astrology-500/50 shadow-inner'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Volume & mute */}
        <div className="flex items-center gap-3.5 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-850">
          <button onClick={toggleMute} className="text-slate-400 hover:text-slate-200">
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4.5 w-4.5 text-rose-450" />
            ) : (
              <Volume2 className="h-4.5 w-4.5 text-astrology-400" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              setIsMuted(false);
            }}
            className="w-20 accent-astrology-500 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
export default AudioPlayer;
