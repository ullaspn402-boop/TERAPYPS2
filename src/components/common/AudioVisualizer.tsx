import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Mic, Activity } from 'lucide-react';

interface AudioVisualizerProps {
  isRecording: boolean;
  isPlaying?: boolean;
  score?: number;
  showFormantData?: boolean;
  targetSound?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isRecording,
  isPlaying = false,
  score,
  showFormantData = true,
  targetSound = '/r/',
}) => {
  const [formants, setFormants] = useState({ f1: 450, f2: 1250, f3: 1850 });

  // Simulate dynamic acoustic formant fluctuations during recording/playback
  useEffect(() => {
    let interval: any;
    if (isRecording || isPlaying) {
      interval = setInterval(() => {
        setFormants({
          f1: Math.round(420 + Math.random() * 80),
          f2: Math.round(1200 + Math.random() * 150),
          f3: targetSound === '/r/' ? Math.round(1680 + Math.random() * 120) : Math.round(2400 + Math.random() * 200),
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPlaying, targetSound]);

  return (
    <div className="bg-[#041627] text-white rounded-xl p-5 border border-slate-700/60 shadow-md">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#86F2E4]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#86F2E4]">
            Acoustic Waveform & Spectrogram Analysis
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Live Recording
            </span>
          )}
          {isPlaying && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Volume2 className="w-3.5 h-3.5" />
              Playing
            </span>
          )}
          {!isRecording && !isPlaying && (
            <span className="text-xs text-slate-400 font-mono">Standby</span>
          )}
        </div>
      </div>

      {/* Waveform Visualization Bars */}
      <div className="h-24 bg-slate-900/90 rounded-lg p-3 flex items-center justify-center gap-1.5 overflow-hidden border border-slate-800 relative">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 grid grid-rows-4 grid-cols-12 pointer-events-none opacity-10">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border-t border-l border-white/20"></div>
          ))}
        </div>

        {/* Dynamic Waveform Bars */}
        {Array.from({ length: 32 }).map((_, i) => {
          let heightPct = 15;
          if (isRecording || isPlaying) {
            // Symmetrical wave envelope
            const distance = Math.abs(i - 16);
            const baseFactor = Math.max(0.2, 1 - distance / 18);
            const randomJitter = Math.random() * 0.5 + 0.5;
            heightPct = Math.min(95, Math.max(15, baseFactor * randomJitter * 90));
          }

          return (
            <div
              key={i}
              className="flex-1 max-w-[8px] rounded-full transition-all duration-100 ease-out"
              style={{
                height: `${heightPct}%`,
                backgroundColor:
                  isRecording
                    ? i % 4 === 0
                      ? '#86F2E4'
                      : '#006A61'
                    : isPlaying
                    ? '#38BDF8'
                    : '#334155',
                boxShadow:
                  isRecording && heightPct > 50
                    ? '0 0 8px rgba(134, 242, 228, 0.4)'
                    : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Acoustic Metrics Grid */}
      {showFormantData && (
        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block font-mono">F1 (Jaw / Height)</span>
            <span className="font-semibold text-slate-200 text-sm mt-0.5 block font-mono">
              {isRecording || isPlaying ? `${formants.f1} Hz` : '440 Hz'}
            </span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block font-mono">F2 (Tongue Advancement)</span>
            <span className="font-semibold text-slate-200 text-sm mt-0.5 block font-mono">
              {isRecording || isPlaying ? `${formants.f2} Hz` : '1240 Hz'}
            </span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block font-mono">F3 (Rhotic Resonance)</span>
            <span className="font-semibold text-[#86F2E4] text-sm mt-0.5 block font-mono flex items-center justify-between">
              <span>{isRecording || isPlaying ? `${formants.f3} Hz` : '1720 Hz'}</span>
              <span className="text-[10px] text-teal-400 font-sans font-normal">
                {targetSound === '/r/' && formants.f3 < 1900 ? '✓ F3 Dip' : 'Target'}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
