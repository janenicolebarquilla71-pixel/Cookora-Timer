import { useCallback, useEffect, useRef, useState } from 'react';

export interface HistoryEntry {
  id: string;
  label: string;
  duration: number;
  completedAt: string;
  recipeId?: string;
}

const HISTORY_STORAGE_KEY = 'cookora_history_v1';
const FAVORITES_STORAGE_KEY = 'cookora_favorites_v1';
const SOUND_STORAGE_KEY = 'cookora_sound_enabled_v1';

export function formatDurationClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export function formatReadableDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0 && m > 0) return `${h} hr ${m} min`;
  if (h > 0) return `${h} hr`;
  if (m > 0 && s > 0) return `${m} min ${s}s`;
  if (m > 0) return `${m} min`;
  return `${s} sec`;
}

export function formatHistoryDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isSameDay) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function useCookingTimer(onToast: (message: string) => void) {
  const [remaining, setRemaining] = useState<number>(600);
  const [initialDuration, setInitialDuration] = useState<number>(600);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAlarming, setIsAlarming] = useState<boolean>(false);
  const [activeLabel, setActiveLabel] = useState<string>('Kitchen Timer');
  const [activeRecipeId, setActiveRecipeId] = useState<string | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState<string>('Your kitchen timer is ready!');

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage parse failure
    }
    return [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage parse failure
    }
    return [];
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmNodesRef = useRef<OscillatorNode[]>([]);
  const alarmTimeoutRef = useRef<number | null>(null);
  const endTimeMsRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  const unlockAudio = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === 'suspended') {
        void audioContextRef.current.resume();
      }
    } catch {
      audioContextRef.current = null;
    }
  }, []);

  const stopAlarm = useCallback(() => {
    alarmNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch {
        // already stopped
      }
    });
    alarmNodesRef.current = [];
    if (alarmTimeoutRef.current !== null) {
      window.clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
    setIsAlarming(false);
  }, []);

  const playChime = useCallback(
    (beepCount = 13) => {
      if (!soundEnabled) return;
      unlockAudio();
      const ctx = audioContextRef.current;
      if (!ctx) return;

      stopAlarm();
      try {
        if (ctx.state === 'suspended') {
          void ctx.resume();
        }
        const startAt = ctx.currentTime + 0.05;
        for (let i = 0; i < beepCount; i++) {
          const at = startAt + i * 0.62;
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, at);
          gain.gain.setValueAtTime(0.0001, at);
          gain.gain.exponentialRampToValueAtTime(0.18, at + 0.025);
          gain.gain.setValueAtTime(0.18, at + 0.22);
          gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
          oscillator.connect(gain);
          gain.connect(ctx.destination);
          oscillator.start(at);
          oscillator.stop(at + 0.3);
          alarmNodesRef.current.push(oscillator);
        }
        setIsAlarming(true);
        alarmTimeoutRef.current = window.setTimeout(() => {
          stopAlarm();
        }, beepCount * 620 + 150);
      } catch {
        stopAlarm();
      }
    },
    [soundEnabled, stopAlarm, unlockAudio]
  );

  const recordCompletion = useCallback(
    (durationSeconds: number, label: string, recipeId?: string) => {
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label,
        duration: durationSeconds,
        completedAt: new Date().toISOString(),
        recipeId,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 20));
    },
    []
  );

  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      if (endTimeMsRef.current === null) return;
      const diffSeconds = Math.max(0, Math.ceil((endTimeMsRef.current - Date.now()) / 1000));
      setRemaining(diffSeconds);

      if (diffSeconds <= 0) {
        endTimeMsRef.current = null;
        setIsRunning(false);
        setStatusMessage("Time's up! Your dish is ready.");
        onToast("Time's up! Check your cooking.");
        playChime(13);
        recordCompletion(initialDuration, activeLabel, activeRecipeId);

        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Cookora Timer', {
              body: `${activeLabel} is finished!`,
            });
          } catch {
            // ignore notification errors on mobile webviews
          }
        }
      }
    };

    const intervalId = window.setInterval(tick, 250);
    return () => window.clearInterval(intervalId);
  }, [activeLabel, activeRecipeId, initialDuration, isRunning, onToast, playChime, recordCompletion]);

  const setDuration = useCallback(
    (
      totalSeconds: number,
      options?: { label?: string; recipeId?: string; message?: string; autoStart?: boolean }
    ) => {
      stopAlarm();
      const safeTotal = Math.max(1, Math.floor(totalSeconds));
      endTimeMsRef.current = options?.autoStart ? Date.now() + safeTotal * 1000 : null;
      setRemaining(safeTotal);
      setInitialDuration(safeTotal);
      setActiveLabel(options?.label ?? 'Kitchen Timer');
      setActiveRecipeId(options?.recipeId);
      setIsRunning(Boolean(options?.autoStart));
      if (options?.autoStart) {
        unlockAudio();
        setStatusMessage('Timer is running. Happy cooking!');
      } else {
        setStatusMessage(options?.message ?? 'Timer updated. Ready when you are!');
      }
    },
    [stopAlarm, unlockAudio]
  );

  const start = useCallback(() => {
    if (isRunning) return;
    stopAlarm();
    unlockAudio();
    const targetSeconds = remaining > 0 ? remaining : initialDuration || 60;
    if (remaining <= 0) {
      setRemaining(targetSeconds);
    }
    endTimeMsRef.current = Date.now() + targetSeconds * 1000;
    setIsRunning(true);
    setStatusMessage('Timer is running. Happy cooking!');
  }, [initialDuration, isRunning, remaining, stopAlarm, unlockAudio]);

  const pause = useCallback(() => {
    if (!isRunning) {
      setStatusMessage('Timer is paused.');
      return;
    }
    if (endTimeMsRef.current !== null) {
      const left = Math.max(0, Math.ceil((endTimeMsRef.current - Date.now()) / 1000));
      setRemaining(left);
    }
    endTimeMsRef.current = null;
    setIsRunning(false);
    setStatusMessage('Timer paused. Take your time!');
  }, [isRunning]);

  const reset = useCallback(() => {
    stopAlarm();
    endTimeMsRef.current = null;
    setIsRunning(false);
    setRemaining(initialDuration);
    setStatusMessage('Timer reset and ready!');
  }, [initialDuration, stopAlarm]);

  const adjustMinutes = useCallback(
    (deltaMinutes: number) => {
      const deltaSeconds = deltaMinutes * 60;
      const nextRemaining = Math.max(10, remaining + deltaSeconds);
      setRemaining(nextRemaining);
      if (nextRemaining > initialDuration) {
        setInitialDuration(nextRemaining);
      }
      if (isRunning) {
        endTimeMsRef.current = Date.now() + nextRemaining * 1000;
      }
    },
    [initialDuration, isRunning, remaining]
  );

  const toggleFavorite = useCallback((recipeId: string) => {
    setFavorites((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
    );
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    onToast('Cooking history cleared.');
  }, [onToast]);

  const testSound = useCallback(() => {
    if (!soundEnabled) {
      setSoundEnabled(true);
    }
    unlockAudio();
    const ctx = audioContextRef.current;
    if (!ctx) {
      onToast('Browser audio is unavailable here.');
      return;
    }
    stopAlarm();
    try {
      if (ctx.state === 'suspended') void ctx.resume();
      const startAt = ctx.currentTime + 0.04;
      for (let i = 0; i < 2; i++) {
        const at = startAt + i * 0.35;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, at);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.18, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(at);
        osc.stop(at + 0.28);
        alarmNodesRef.current.push(osc);
      }
      onToast('Playing sample timer chime!');
    } catch {
      onToast('Could not play chime in this browser.');
    }
  }, [onToast, soundEnabled, stopAlarm, unlockAudio]);

  return {
    remaining,
    initialDuration,
    isRunning,
    isAlarming,
    activeLabel,
    activeRecipeId,
    statusMessage,
    soundEnabled,
    setSoundEnabled,
    history,
    favorites,
    setDuration,
    start,
    pause,
    reset,
    stopAlarm,
    adjustMinutes,
    toggleFavorite,
    clearHistory,
    testSound,
  };
}
