import React, { useState, useEffect, useRef } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Play, Pause, RotateCcw, Settings as SettingsIcon, Timer, X, Volume2, BellRing, Smartphone } from "lucide-react";
import { cn } from "./utils";

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

// AudioContext singleton
let sharedAudioContext: AudioContext | null = null;
const getAudioContext = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioContext || sharedAudioContext.state === "closed") {
      sharedAudioContext = new AudioContextClass();
    }
    if (sharedAudioContext.state === "suspended") {
      sharedAudioContext.resume().catch(() => {});
    }
    return sharedAudioContext;
  } catch (e) {
    return null;
  }
};

// Loud, piercing digital alarm burst (Sawtooth + Square dual oscillators with harmonic screaming frequencies)
export const playLoudAlarmBurst = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Urgent 2-cycle piercing pattern: Beep-Beep-Beep-BEEEEEEP! followed by siren burst
    const beeps = [
      { time: now + 0.00, duration: 0.16, freq: 880 },
      { time: now + 0.22, duration: 0.16, freq: 880 },
      { time: now + 0.44, duration: 0.16, freq: 880 },
      { time: now + 0.66, duration: 0.55, freq: 1174.6 }, // High D6 piercing tone
      // Second piercing round
      { time: now + 1.30, duration: 0.16, freq: 987.77 }, // B5
      { time: now + 1.52, duration: 0.16, freq: 987.77 },
      { time: now + 1.74, duration: 0.16, freq: 987.77 },
      { time: now + 1.96, duration: 0.55, freq: 1396.9 }, // High F6 scream
    ];

    beeps.forEach(({ time, duration, freq }) => {
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, time);

      oscHarmonic.type = "square";
      oscHarmonic.frequency.setValueAtTime(freq * 1.5, time);

      // Max penetrating volume
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(0.95, time + 0.02);
      gain.gain.setValueAtTime(0.95, time + duration - 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
      oscHarmonic.start(time);
      oscHarmonic.stop(time + duration);
    });
  } catch (e) {
    console.warn("Audio alarm playback error:", e);
  }
};

// Continuous vibration trigger
const triggerVibration = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      // Vibrate pattern: 500ms on, 200ms off, 500ms on, 200ms off, 800ms on
      navigator.vibrate([500, 200, 500, 200, 800, 200]);
    } catch (e) {
      console.warn("Vibration trigger error:", e);
    }
  }
};

// Backward-compatible export
export const playLoudAlarm = playLoudAlarmBurst;

// Global intervals for recurring looping alarm and vibration
let alarmAudioInterval: number | null = null;
let alarmVibrationInterval: number | null = null;

// Global state to persist across tab switches
let globalSettings = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

// Try to load saved settings
try {
  const saved = localStorage.getItem("jee_pomodoro_settings");
  if (saved) {
    globalSettings = { ...globalSettings, ...JSON.parse(saved) };
  }
} catch (e) {}

let globalMode: TimerMode = "pomodoro";
let globalTimeLeft = globalSettings.pomodoro;
let globalIsRunning = false;
let globalInterval: number | null = null;
let globalAlarmRinging = false;

const listeners = new Set<() => void>();
const notifyListeners = () => listeners.forEach((l) => l());

// Start looping loud alarm AND continuous vibration until dismissed
export const startAlarmLoop = () => {
  stopAlarmLoop(); // Clean any previous timers
  globalAlarmRinging = true;

  // 1. Play first audio burst & vibration immediately
  playLoudAlarmBurst();
  triggerVibration();

  // 2. Loop audio burst every 2.5s continuously
  alarmAudioInterval = window.setInterval(() => {
    if (!globalAlarmRinging) {
      stopAlarmLoop();
      return;
    }
    playLoudAlarmBurst();
  }, 2500);

  // 3. Loop vibration every 2.5s continuously
  alarmVibrationInterval = window.setInterval(() => {
    if (!globalAlarmRinging) {
      stopAlarmLoop();
      return;
    }
    triggerVibration();
  }, 2500);

  notifyListeners();
};

// Stop alarm loop, halt sound, and cancel vibration immediately
export const stopAlarmLoop = () => {
  globalAlarmRinging = false;
  if (alarmAudioInterval) {
    clearInterval(alarmAudioInterval);
    alarmAudioInterval = null;
  }
  if (alarmVibrationInterval) {
    clearInterval(alarmVibrationInterval);
    alarmVibrationInterval = null;
  }
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(0); // Immediately stops vibration
    } catch (e) {}
  }
  notifyListeners();
};

export const isGlobalAlarmRinging = () => globalAlarmRinging;

export const subscribeToPomodoro = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

const toggleGlobalTimer = () => {
  if (globalAlarmRinging) {
    stopAlarmLoop();
  }
  if (globalIsRunning) {
    globalIsRunning = false;
    if (globalInterval) clearInterval(globalInterval);
    globalInterval = null;
  } else {
    // Resume audio context on user gesture
    getAudioContext();
    globalIsRunning = true;
    if (globalInterval) clearInterval(globalInterval);
    globalInterval = window.setInterval(() => {
      if (globalTimeLeft <= 1) {
        globalTimeLeft = 0;
        globalIsRunning = false;
        if (globalInterval) clearInterval(globalInterval);
        globalInterval = null;
        // START LOUD ALARM LOOP & CONTINUOUS VIBRATION
        startAlarmLoop();
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          const title = globalMode === "pomodoro" ? "Focus Session Completed!" : "Break Over!";
          const body = globalMode === "pomodoro" 
            ? "Great job! Time for a well-deserved break." 
            : "Break is over! Time to get back into focus mode.";
          new Notification(title, { body });
        }
      } else {
        globalTimeLeft -= 1;
      }
      notifyListeners();
    }, 1000);
  }
  notifyListeners();
};

const resetGlobalTimer = () => {
  stopAlarmLoop();
  globalIsRunning = false;
  if (globalInterval) clearInterval(globalInterval);
  globalInterval = null;
  globalTimeLeft = globalSettings[globalMode];
  notifyListeners();
};

const changeGlobalMode = (newMode: TimerMode) => {
  stopAlarmLoop();
  globalIsRunning = false;
  if (globalInterval) clearInterval(globalInterval);
  globalInterval = null;
  globalMode = newMode;
  globalTimeLeft = globalSettings[globalMode];
  notifyListeners();
};

const updateGlobalSettings = (newSettings: typeof globalSettings) => {
  const wasRunning = globalIsRunning;
  if (wasRunning) {
    toggleGlobalTimer(); // pause it
  }
  globalSettings = newSettings;
  localStorage.setItem("jee_pomodoro_settings", JSON.stringify(globalSettings));
  globalTimeLeft = globalSettings[globalMode];
  notifyListeners();
};

export function Pomodoro() {
  const [, setTick] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    pomodoro: globalSettings.pomodoro / 60,
    shortBreak: globalSettings.shortBreak / 60,
    longBreak: globalSettings.longBreak / 60,
  });

  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = ((globalSettings[globalMode] - globalTimeLeft) / globalSettings[globalMode]) * 100;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateGlobalSettings({
      pomodoro: tempSettings.pomodoro * 60,
      shortBreak: tempSettings.shortBreak * 60,
      longBreak: tempSettings.longBreak * 60,
    });
    setShowSettings(false);
  };

  const getModeTitle = () => {
    if (globalMode === "pomodoro") return "Focus Session";
    if (globalMode === "shortBreak") return "Short Break";
    return "Long Break";
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 md:p-8 relative overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl shadow-blue-900/5">
      <div className="flex flex-col items-center relative z-10">
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Timer className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Focus Timer</h2>
          </div>
          <div className="flex items-center gap-2">
            {globalAlarmRinging ? (
              <button
                onClick={stopAlarmLoop}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow animate-pulse"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Stop Alarm</span>
              </button>
            ) : (
              <button
                onClick={() => startAlarmLoop()}
                title="Test continuous loud alarm & vibration loop"
                className="p-1.5 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Test Alarm &amp; Vibrate</span>
              </button>
            )}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOUD RINGING & CONTINUOUS VIBRATING ALARM BANNER */}
        {globalAlarmRinging && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white shadow-2xl border-2 border-white/40 animate-pulse flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-full animate-bounce shrink-0">
                <BellRing className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                  <span>⚠️ ALARM RINGING &amp; VIBRATING!</span>
                </div>
                <p className="text-xs text-white/90 font-medium">
                  {getModeTitle()} completed! Ringing and vibrating until dismissed.
                </p>
              </div>
            </div>
            <button 
              onClick={stopAlarmLoop}
              className="w-full sm:w-auto px-5 py-2.5 bg-white text-red-700 hover:bg-red-50 text-xs sm:text-sm font-extrabold rounded-xl shadow-lg transition-transform active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
            >
              <span>✋ DISMISS ALARM</span>
            </button>
          </div>
        )}

        {showSettings ? (
          <div className="w-full mb-8 bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700 dark:text-slate-200">Timer Settings (minutes)</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600 dark:text-slate-300">Focus Session</label>
                <input 
                  type="number" min="1" max="360" required
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded text-right"
                  value={tempSettings.pomodoro}
                  onChange={(e) => setTempSettings({...tempSettings, pomodoro: Number(e.target.value)})}
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600 dark:text-slate-300">Short Break</label>
                <input 
                  type="number" min="1" max="60" required
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded text-right"
                  value={tempSettings.shortBreak}
                  onChange={(e) => setTempSettings({...tempSettings, shortBreak: Number(e.target.value)})}
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600 dark:text-slate-300">Long Break</label>
                <input 
                  type="number" min="1" max="60" required
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded text-right"
                  value={tempSettings.longBreak}
                  onChange={(e) => setTempSettings({...tempSettings, longBreak: Number(e.target.value)})}
                />
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 dark:text-slate-300 font-medium flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" /> Continuous Alarm + Vibration
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">Enabled</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startAlarmLoop()}
                    className="flex-1 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Start Test Loop
                  </button>
                  <button
                    type="button"
                    onClick={stopAlarmLoop}
                    className="flex-1 py-1.5 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Stop Test
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full mt-4 py-2">Save Settings</Button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-full mb-8">
              {(["pomodoro", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => changeGlobalMode(m)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-semibold transition-colors",
                    globalMode === m
                      ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                  )}
                >
                  {m === "pomodoro" ? "Focus" : m === "shortBreak" ? "Short Break" : "Long Break"}
                </button>
              ))}
            </div>

            <div className="relative flex items-center justify-center mb-8">
              <div className={cn(
                "text-5xl md:text-6xl font-mono font-bold tracking-tighter tabular-nums drop-shadow-sm transition-colors",
                globalAlarmRinging ? "text-red-600 animate-pulse" : "text-gray-900 dark:text-white"
              )}>
                {formatTime(globalTimeLeft)}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={toggleGlobalTimer}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center p-0 transition-all",
                  globalAlarmRinging 
                    ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 animate-pulse font-bold"
                    : globalIsRunning 
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200" 
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 font-bold"
                )}
                variant={globalIsRunning ? "outline" : "primary"}
              >
                {globalAlarmRinging ? (
                  <BellRing className="w-8 h-8 fill-current" />
                ) : globalIsRunning ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </Button>
              
              <Button
                onClick={resetGlobalTimer}
                variant="outline"
                className="w-12 h-12 rounded-full p-0 flex items-center justify-center border-gray-200 text-gray-500 hover:bg-gray-50"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </>
        )}
      </div>
      
      {/* Background Progress Indicator */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-linear",
          globalAlarmRinging 
            ? "bg-red-600 animate-pulse" 
            : globalMode === "pomodoro" 
            ? "bg-blue-500" 
            : globalMode === "shortBreak" 
            ? "bg-emerald-500" 
            : "bg-purple-500"
        )}
        style={{ width: `${progress}%` }}
      />
    </Card>
  );
}
