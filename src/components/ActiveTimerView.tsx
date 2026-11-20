import React from 'react';
import { BellOff, ChevronLeft, Music, Pause, Play, RotateCcw, VolumeX } from 'lucide-react';
import { SimmeringPotSvg } from './Illustrations';
import { formatDurationClock } from '../hooks/useCookingTimer';

interface ActiveTimerViewProps {
  remaining: number;
  initialDuration: number;
  isRunning: boolean;
  isAlarming: boolean;
  activeLabel: string;
  statusMessage: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onBack: () => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStopAlarm: () => void;
  onAdjustMinutes: (delta: number) => void;
}

export function ActiveTimerView({
  remaining,
  initialDuration,
  isRunning,
  isAlarming,
  activeLabel,
  statusMessage,
  soundEnabled,
  onToggleSound,
  onBack,
  onStart,
  onPause,
  onReset,
  onStopAlarm,
  onAdjustMinutes,
}: ActiveTimerViewProps) {
  const safeTotal = Math.max(1, initialDuration);
  const progress = Math.min(1, Math.max(0, remaining / safeTotal));

  const radius = 112;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <section
      aria-label="Active kitchen timer"
      className="relative min-h-full flex flex-col justify-between bg-[#FBF9F5] overflow-hidden"
    >
      {/* Soft Pastel Blue Cloud Wave Background behind Pot (matching Screen 2) */}
      <svg
        viewBox="0 0 400 220"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full h-[54%] text-[#E8EFFD]"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,44 C65,12 130,60 205,36 C280,12 340,48 400,26 L400,220 L0,220 Z"
        />
        <path
          fill="#FBF9F5"
          d="M0,152 C95,134 195,164 295,142 C345,132 378,138 400,146 L400,220 L0,220 Z"
        />
      </svg>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-2 pb-1">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[42px] min-w-[42px] inline-flex items-center justify-center rounded-2xl text-[#2B3F60] hover:bg-white/70 transition-colors"
          aria-label="Back to timer setup"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h2 className="text-[15px] font-black text-[#2B3F60] truncate px-2">
          {activeLabel}
        </h2>

        <button
          type="button"
          onClick={onToggleSound}
          className="min-h-[42px] min-w-[42px] inline-flex items-center justify-center rounded-2xl text-[#2B3F60] hover:bg-white/70 transition-colors"
          aria-label={soundEnabled ? 'Mute timer chime' : 'Unmute timer chime'}
          title={soundEnabled ? 'Sound On' : 'Sound Muted'}
        >
          {soundEnabled ? (
            <Music className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5 text-[#7B869C]" />
          )}
        </button>
      </div>

      {/* Center Circular Ring + Chef Hat + Time + Simmering Pot */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 my-auto py-2">
        <div className="relative w-[264px] h-[264px] flex items-center justify-center">
          {/* Chef Hat sitting at top-center of ring */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
            aria-hidden="true"
          >
            <svg viewBox="0 0 46 36" fill="none" className="w-11 h-8">
              <path
                d="M11 23C7 22.5 4.5 18.8 5 14.5C5.4 10.8 8.5 8 12.2 8.2C14.2 4.3 18.2 2 23 2C27.8 2 31.8 4.3 33.8 8.2C37.5 8 40.6 10.8 41 14.5C41.5 18.8 39 22.5 35 23V29.5H11V23Z"
                fill="#FFFFFF"
                stroke="#2B3F60"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M11 26.5H35" stroke="#2B3F60" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <svg viewBox="0 0 260 260" className="w-full h-full -rotate-90" aria-hidden="true">
            <defs>
              <linearGradient id="cookoraSplitRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE39B" />
                <stop offset="48%" stopColor="#B8CEF8" />
                <stop offset="100%" stopColor="#9AB8F7" />
              </linearGradient>
            </defs>
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke="#E6EBF5"
              strokeWidth="13"
            />
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke="url(#cookoraSplitRing)"
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-300 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-5">
            <div className="font-timer text-[38px] font-black tracking-tight text-[#2B3F60] leading-none">
              {formatDurationClock(remaining)}
            </div>
            <span className="text-xs font-bold text-[#657289] mt-1.5">
              {remaining === 0 ? 'Time is up!' : 'Time Remaining'}
            </span>
            <div className="mt-2">
              <SimmeringPotSvg isRunning={isRunning} className="w-24 h-20" />
            </div>
          </div>
        </div>

        {/* Tiny Sparkle Lines like the Mockup */}
        <p className="text-[11px] font-bold text-[#657289] mt-1 text-center">{statusMessage}</p>

        <div className="flex items-center gap-2.5 mt-2.5">
          <button
            type="button"
            onClick={() => onAdjustMinutes(-1)}
            className="min-h-[36px] px-3.5 py-1 rounded-full bg-white/90 border border-[#E5E2DC] text-[11px] font-extrabold text-[#2B3F60] hover:bg-white transition-colors"
          >
            - 1 min
          </button>
          <button
            type="button"
            onClick={() => onAdjustMinutes(1)}
            className="min-h-[36px] px-3.5 py-1 rounded-full bg-white/90 border border-[#E5E2DC] text-[11px] font-extrabold text-[#2B3F60] hover:bg-white transition-colors"
          >
            + 1 min
          </button>
        </div>
      </div>

      {/* Bottom Circular Pause & Reset Controls */}
      <div className="relative z-10 px-6 pb-5 pt-2 flex flex-col items-center gap-3">
        {isAlarming && (
          <button
            type="button"
            onClick={onStopAlarm}
            className="w-full max-w-[260px] min-h-[44px] px-5 py-2.5 rounded-full bg-[#FFE39B] text-[#2B3F60] font-black text-xs inline-flex items-center justify-center gap-2 shadow-xs hover:bg-[#FFD877] transition-colors"
          >
            <BellOff className="w-4 h-4" />
            Stop Alarm
          </button>
        )}

        <div className="flex items-center justify-center gap-12">
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={isRunning ? onPause : onStart}
              className="w-[62px] h-[62px] rounded-full bg-[#DCE6FA] text-[#2B3F60] flex items-center justify-center shadow-xs hover:bg-[#CDDDF9] active:scale-[0.95] transition-all"
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>
            <span className="text-xs font-extrabold text-[#2B3F60]">
              {isRunning ? 'Pause' : remaining === 0 ? 'Restart' : 'Start'}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={onReset}
              className="w-[62px] h-[62px] rounded-full bg-[#ECECEF] text-[#2B3F60] flex items-center justify-center shadow-xs hover:bg-[#E1E2E7] active:scale-[0.95] transition-all"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <span className="text-xs font-extrabold text-[#2B3F60]">Reset</span>
          </div>
        </div>
      </div>
    </section>
  );
}
