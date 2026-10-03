import { useState, useEffect } from "react";
import { Hero } from "./components/Hero";
import { DailyGoals } from "./components/DailyGoals";
import { DoubtSolver } from "./components/DoubtSolver";
import { Feedback, Owners, Community } from "./components/ExtraSections";
import { Auth } from "./components/Auth";
import { Motivation } from "./components/Motivation";
import { Pomodoro, isGlobalAlarmRinging, stopAlarmLoop, subscribeToPomodoro } from "./components/Pomodoro";
import { MockTracker } from "./components/MockTracker";
import { StudyStreak } from "./components/StudyStreak";
import { LandingPage } from "./components/LandingPage";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./components/utils";
import { LogIn, X, BellRing, Sun, Moon, Lock } from "lucide-react";

function JeeManthanLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="jmCosmic" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="60%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#030712" />
        </radialGradient>
        <linearGradient id="jmGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#jmCosmic)" stroke="#06b6d4" strokeWidth="1.5" />
      <ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="url(#ringGrad)" strokeWidth="1.2" opacity="0.8" transform="rotate(30 50 50)" />
      <ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="url(#ringGrad)" strokeWidth="1.2" opacity="0.8" transform="rotate(-30 50 50)" />
      <ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="url(#ringGrad)" strokeWidth="1.2" opacity="0.8" transform="rotate(90 50 50)" />
      <circle cx="20" cy="35" r="2.5" fill="#38bdf8" />
      <circle cx="80" cy="65" r="2.5" fill="#c084fc" />
      <circle cx="50" cy="12" r="2" fill="#fbbf24" />
      <text x="50" y="58" textAnchor="middle" fill="url(#jmGold)" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="26" letterSpacing="-1">JM</text>
    </svg>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem("jee_current_user"));
  const [activeTab, setActiveTab] = useState("3D Overview");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(() => isGlobalAlarmRinging());
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("jee_theme");
    if (saved === "light" || saved === "dark") return saved;
    return "dark";
  });

  useEffect(() => {
    localStorage.setItem("jee_theme", theme);
    if (activeTab === "3D Overview" || theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, activeTab]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const unsubscribe = subscribeToPomodoro(() => {
      setIsAlarmActive(isGlobalAlarmRinging());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("jee_") && key !== "jee_current_user") {
          data[key] = localStorage.getItem(key) || "";
        }
      }
      fetch(`/api/data/sync/${currentUser}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      }).catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Periodic sync every 30 seconds
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(async () => {
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("jee_") && key !== "jee_current_user") {
          data[key] = localStorage.getItem(key) || "";
        }
      }
      try {
        await fetch(`/api/data/sync/${currentUser}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data })
        });
      } catch (err) {
        // Silent failure for background sync
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out? Your recent data will be synced before logout.")) {
      if (currentUser) {
        const data: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("jee_") && key !== "jee_current_user") {
            data[key] = localStorage.getItem(key) || "";
          }
        }
        try {
          await fetch(`/api/data/sync/${currentUser}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data })
          });
        } catch (err) {
          console.error("Logout sync failed", err);
        }
      }
      localStorage.removeItem("jee_current_user");
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("jee_")) localStorage.removeItem(key);
      });
      setCurrentUser(null);
      setActiveTab("3D Overview");
    }
  };

  const navItems = [
    "3D Overview",
    "Home",
    "Timer",
    "Mock Tests",
    "Doubt Solver",
    "Community",
    "Feedback",
    "Owners"
  ];

  const handleTabChange = (tab: string) => {
    if (!currentUser && tab !== "3D Overview") {
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const is3DPage = activeTab === "3D Overview";

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col relative transition-colors duration-300",
      is3DPage 
        ? "bg-[#070b19] text-slate-100" 
        : (theme === "dark" ? "bg-slate-950 text-slate-100 dark" : "bg-gray-50 text-gray-900")
    )}>
      
      {/* Background Layer for non-3D pages */}
      {!is3DPage && (
        theme === "dark" ? (
          <div 
            className="fixed inset-0 z-0 opacity-25 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px]"
          />
        ) : (
          <div 
            className="fixed inset-0 z-0 opacity-40 pointer-events-none bg-gradient-to-br from-blue-50 via-white to-purple-50"
          />
        )
      )}
      
      {/* Global Loop Ringing & Vibrating Alarm Alert (Visible on every screen until dismissed) */}
      {isAlarmActive && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-4 py-3 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse border-b-2 border-white/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/25 rounded-full animate-bounce shrink-0">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>⚠️ POMODORO ALARM IS RINGING &amp; VIBRATING!</span>
              </div>
              <p className="text-xs text-white/90 font-medium">
                Your study timer completed. The loud alarm &amp; vibration will loop continuously until dismissed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleTabChange("Timer")}
              className="px-3 py-1.5 bg-black/25 hover:bg-black/40 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Go to Timer
            </button>
            <button
              onClick={() => stopAlarmLoop()}
              className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 text-xs sm:text-sm font-extrabold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <span>✋ DISMISS ALARM</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <nav className={cn(
        "sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300",
        is3DPage 
          ? "bg-slate-950/80 border-slate-800/80 shadow-2xl" 
          : (theme === "dark" ? "bg-slate-900/85 border-slate-800/90 shadow-xl" : "bg-white/80 border-gray-200 shadow-sm")
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-0 md:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0"
            onClick={() => handleTabChange("3D Overview")}
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="w-9 h-9 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] relative flex items-center justify-center shrink-0 bg-slate-950 p-1"
            >
              <JeeManthanLogo />
            </motion.div>
            <span className={cn(
              "font-extrabold text-lg md:text-xl tracking-tight hidden sm:inline",
              is3DPage || theme === "dark" ? "text-white" : "text-gray-900"
            )}>
              JEE MANTHAN
            </span>
          </div>

          {/* Navigation Tabs - Horizontally scrollable without any sticky overlap */}
          <div className="flex-1 min-w-0 flex items-center overflow-x-auto py-1 text-sm font-semibold gap-1.5 sm:gap-2 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {navItems.map((item) => {
              const isLocked = !currentUser && item !== "3D Overview";
              return (
                <button
                  key={item}
                  onClick={() => handleTabChange(item)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap text-xs sm:text-sm shrink-0 flex items-center gap-1.5",
                    item === "3D Overview" && is3DPage
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                      : activeTab === item 
                        ? (is3DPage || theme === "dark" ? "bg-blue-600/30 text-blue-300 border border-blue-500/30" : "bg-blue-100 text-blue-700") 
                        : (is3DPage || theme === "dark" ? "text-slate-400 hover:text-white hover:bg-slate-800/60" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50")
                  )}
                >
                  <span>{item === "3D Overview" ? "⚡ 3D Overview" : item}</span>
                  {isLocked && <Lock className="w-3 h-3 opacity-60 text-slate-400" />}
                </button>
              );
            })}
          </div>

          {/* Theme Switcher & Auth / Account Controls */}
          <div className="shrink-0 flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2">
            {/* Theme Toggle Button (Light / Dark Mode for Non-3D Sections) */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Light/Dark Theme"
              className={cn(
                "p-2 rounded-full transition-all flex items-center justify-center shrink-0 border",
                is3DPage || theme === "dark"
                  ? "text-amber-300 hover:text-amber-200 bg-slate-800/80 hover:bg-slate-750 border-slate-700 shadow-sm"
                  : "text-indigo-600 hover:text-indigo-700 bg-gray-100 hover:bg-gray-200 border-gray-200 shadow-sm"
              )}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
              )}
            </button>

            {currentUser ? (
              <div className={cn(
                "flex items-center gap-2 border-l pl-2 sm:pl-3",
                is3DPage || theme === "dark" ? "border-slate-800" : "border-gray-200"
              )}>
                <StudyStreak />
                <span className={cn(
                  "font-bold mr-1 whitespace-nowrap hidden lg:inline text-xs sm:text-sm",
                  is3DPage || theme === "dark" ? "text-slate-200" : "text-gray-800"
                )}>
                  Hi, {currentUser}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full transition-colors whitespace-nowrap text-red-400 hover:bg-red-500/10 text-xs sm:text-sm font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className={cn(
                "flex items-center pl-1 sm:pl-2.5 border-l",
                is3DPage || theme === "dark" ? "border-slate-800" : "border-gray-200"
              )}>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md shadow-blue-500/25 whitespace-nowrap flex items-center gap-1.5 text-xs sm:text-sm border border-blue-400/30"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login / Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 relative z-10 w-full min-h-[500px]",
        is3DPage ? "p-0" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10"
      )}>
        {!currentUser && !is3DPage ? (
          <div className="flex flex-col items-center justify-center min-h-[520px] py-10 px-4">
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-md">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  Sign In to Access {activeTab}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Please log in or create an account to start using JEE MANTHAN tools.
                </p>
              </div>
              <Auth onLogin={(user) => {
                setCurrentUser(user);
                setShowAuthModal(false);
              }} />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "3D Overview" && (
              <motion.div
                key="3DOverview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <LandingPage
                  onOpenAuth={() => setShowAuthModal(true)}
                  onExploreFeature={(tab) => handleTabChange(tab)}
                  isLoggedIn={!!currentUser}
                />
              </motion.div>
            )}

            {activeTab === "Home" && (
              <motion.div
                key="Home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Motivation />
                <Hero />
                <DailyGoals />
              </motion.div>
            )}

            {activeTab === "Timer" && (
              <motion.div
                key="Timer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Pomodoro />
              </motion.div>
            )}

            {activeTab === "Mock Tests" && (
              <motion.div
                key="MockTests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MockTracker />
              </motion.div>
            )}

            {activeTab === "Doubt Solver" && (
              <motion.div
                key="DoubtSolver"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DoubtSolver />
              </motion.div>
            )}

            {activeTab === "Feedback" && (
              <motion.div
                key="Feedback"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Feedback />
              </motion.div>
            )}

            {activeTab === "Community" && (
              <motion.div
                key="Community"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Community />
              </motion.div>
            )}

            {activeTab === "Owners" && (
              <motion.div
                key="Owners"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Owners />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Global Auth Modal for Login/Signup */}
        <AnimatePresence>
          {showAuthModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="relative w-full max-w-md"
              >
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute -top-3 -right-3 z-20 w-9 h-9 rounded-full bg-slate-900 shadow-xl text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 hover:bg-slate-800 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                <Auth onLogin={(user) => {
                  setCurrentUser(user);
                  setShowAuthModal(false);
                  if (activeTab === "3D Overview") {
                    setActiveTab("Home");
                  }
                }} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className={cn(
        "border-t py-8 mt-auto text-center text-sm relative z-10 transition-colors duration-300",
        is3DPage || theme === "dark" ? "bg-slate-950/80 border-slate-800/80 text-slate-400" : "bg-white/80 border-gray-200 text-gray-500"
      )}>
        <p>&copy; {new Date().getFullYear()} JEE MANTHAN. Built for Aspirants.</p>
      </footer>
    </div>
  );
}
