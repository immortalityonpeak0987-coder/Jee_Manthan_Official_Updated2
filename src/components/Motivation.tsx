import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { Card } from "./Card";
import { cn } from "./utils";

const QUOTES = [
  "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing. \n- Pelé",
  "The difference between ordinary and extraordinary is that little extra. \n- Jimmy Johnson",
  "Don't stop when you're tired. Stop when you're done. \n- David Goggins",
  "There are no shortcuts to any place worth going. \n- Beverly Sills",
  "You don't have to be great to start, but you have to start to be great. \n- Zig Ziglar",
  "Push yourself, because no one else is going to do it for you.",
  "Strive for progress, not perfection.",
  "Your future is created by what you do today, not tomorrow. \n- Robert Kiyosaki",
  "Wake up with determination. Go to bed with satisfaction.",
  "Discipline is choosing between what you want now and what you want most. \n- Abraham Lincoln",
];

export function Motivation() {
  const [quote, setQuote] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pick a random quote on mount
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(randomQuote);
    setIsVisible(true);
    // An optional daily or interval refresh could go here
  }, []);

  if (!quote) return null;
  const [text, author] = quote.split("\n-");

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600/10 via-blue-500/5 to-purple-600/10 border border-blue-200/50 dark:border-blue-900/40 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 h-full rounded-l-2xl"></div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4 relative z-10">
              <div className="flex-shrink-0 bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm text-blue-600 dark:text-blue-400 self-start md:self-center">
                <Sparkles size={24} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-blue-800 dark:text-blue-300 mb-1">Quote of the Moment</h3>
                <p className="text-lg md:text-xl font-medium text-gray-800 dark:text-slate-100 leading-relaxed font-serif italic">
                  "{text.trim()}"
                </p>
                {author && (
                  <p className="mt-2 text-sm font-semibold text-gray-600 dark:text-slate-400 flex items-center before:content-['—'] before:mr-2">
                    {author.trim()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
