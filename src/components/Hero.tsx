import React from "react";
import { Button } from "./Button";
import { motion } from "motion/react";
import { Send } from "lucide-react";

export function Hero() {
  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-2xl mb-12 shadow-2xl">
      {/* High-res IIT / Academic Campus Visual with fallback */}
      <img
        src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop"
        alt="Target IIT Campus"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dynamic Cosmic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-blue-950/40 z-0"></div>
      
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4" style={{ perspective: "1000px" }}>
        <motion.div
          initial={{ opacity: 0, rotateX: 60, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          whileHover={{ rotateX: 5, rotateY: -5, scale: 1.02 }}
          className="max-w-3xl will-change-transform transform-gpu"
        >
          <span className="px-4 py-1.5 rounded-full bg-blue-600/30 text-blue-200 border border-blue-500/30 text-sm font-semibold tracking-wider uppercase mb-6 inline-block shadow-lg">
            Target IIT
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-300 via-white to-blue-600 tracking-tight mb-6 mt-2 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            JEE MANTHAN
          </h1>
          <p className="text-xl md:text-2xl text-blue-50 mb-10 font-serif italic max-w-2xl mx-auto leading-relaxed shadow-sm">
            Your Ultimate Companion for JEE Preparation. Connect with thousands of aspirants, track goals, and solve doubts instantly.
          </p>
          
          <a
            href="https://t.me/+-k4CAtxqAudkZGY1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
              <Send className="mr-2 w-5 h-5" />
              Join Telegram Group
            </Button>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
