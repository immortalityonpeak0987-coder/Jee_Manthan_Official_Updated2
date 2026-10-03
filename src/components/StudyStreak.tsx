import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { motion } from "motion/react";

export function StudyStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Simple logic to maintain daily streak based on localStorage goals
    const savedGoals = localStorage.getItem("jee_daily_goals");
    const lastActiveDate = localStorage.getItem("jee_last_active_date");
    const currentStreakStr = localStorage.getItem("jee_current_streak") || "0";
    
    let currentStreak = parseInt(currentStreakStr, 10);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Check if the user completed goals yesterday
    if (lastActiveDate) {
      const lastDate = new Date(lastActiveDate);
      const currDate = new Date(today);
      const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // They were active yesterday, they maintain the streak for now
        // Assuming they opened the app today, we don't increment until they do something 
        // But for a simple "Study Streak", just opening the app daily could count.
        // Let's increment streak if checking in on a new day.
        currentStreak += 1;
        localStorage.setItem("jee_current_streak", currentStreak.toString());
        localStorage.setItem("jee_last_active_date", today);
      } else if (diffDays > 1) {
        // Streak broken
        currentStreak = 1;
        localStorage.setItem("jee_current_streak", currentStreak.toString());
        localStorage.setItem("jee_last_active_date", today);
      } else if (diffDays === 0) {
        // Already logged in today
        if (currentStreak === 0) {
            currentStreak = 1;
            localStorage.setItem("jee_current_streak", "1");
        }
      }
    } else {
      // First time
      currentStreak = 1;
      localStorage.setItem("jee_current_streak", "1");
      localStorage.setItem("jee_last_active_date", today);
    }
    
    setStreak(currentStreak);
  }, []);

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full shadow-sm font-bold text-sm mr-2 whitespace-nowrap"
    >
      <Flame className="w-4 h-4 mr-1 text-orange-500" fill="currentColor" />
      <span>{streak} Day Streak</span>
    </motion.div>
  );
}
