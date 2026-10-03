import React, { useState, Suspense } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Brain, 
  Clock, 
  Target, 
  LineChart, 
  Users, 
  Send, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  BookOpen, 
  ChevronRight 
} from "lucide-react";
import { LandingScene3D } from "./LandingScene3D";
import { Button } from "./Button";

interface LandingPageProps {
  onOpenAuth: () => void;
  onExploreFeature?: (tab: string) => void;
  isLoggedIn?: boolean;
}

export function LandingPage({ onOpenAuth, onExploreFeature, isLoggedIn }: LandingPageProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<"physics" | "math" | "chemistry">("physics");

  const handleFeatureClick = (tab: string) => {
    if (!isLoggedIn) {
      onOpenAuth();
      return;
    }
    if (onExploreFeature) {
      onExploreFeature(tab);
    } else {
      onOpenAuth();
    }
  };

  const previews = {
    physics: {
      question: "Q. A particle of mass m moves under central force F = -k/r². Find its angular momentum & stability of circular orbit.",
      steps: [
        "1. Torque τ = r × F = 0 since force is purely radial, hence Angular Momentum L = const.",
        "2. Effective potential V_eff(r) = L²/(2mr²) - k/r.",
        "3. Equilibrium condition: dV_eff/dr = 0 ⇒ r₀ = L²/(mk).",
        "4. Stable since d²V_eff/dr² > 0 at r = r₀."
      ],
      diagram: "/api/diagram?prompt=central+force+orbital+mechanics+potential+curve"
    },
    math: {
      question: "Q. Evaluate definite integral: I = ∫[0 to π/2] (sin⁴(x) / (sin⁴(x) + cos⁴(x))) dx",
      steps: [
        "1. Apply King's Property: ∫[a to b] f(x)dx = ∫[a to b] f(a + b - x)dx.",
        "2. Here a + b - x = π/2 - x, so sin(π/2 - x) = cos(x) and vice versa.",
        "3. Adding both equations: 2I = ∫[0 to π/2] 1 dx = π/2.",
        "4. Therefore, I = π/4."
      ],
      diagram: "/api/diagram?prompt=calculus+definite+integral+symmetry+curve"
    },
    chemistry: {
      question: "Q. Predict major product: 2-Bromobutane treated with alc. KOH under high temperature.",
      steps: [
        "1. Alcoholic KOH acts as a strong base inducing E2 dehydrohalogenation.",
        "2. According to Zaitsev's rule, the more substituted and thermodynamically stable alkene dominates.",
        "3. Major product: But-2-ene (predominantly trans-isomer due to steric relief).",
        "4. Minor product: But-1-ene (Hofmann product)."
      ],
      diagram: "/api/diagram?prompt=organic+chemistry+reaction+energy+profile"
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-cyan-400" />,
      title: "AI Instant Doubt Solver",
      badge: "Smart Multi-Modal Engine",
      tab: "Doubt Solver",
      desc: "Instant step-by-step breakdown with LaTeX math notation. Need visualization? Auto-generates free-body & circuit diagrams."
    },
    {
      icon: <Clock className="w-6 h-6 text-indigo-400" />,
      title: "Zen Pomodoro & Mock Mode",
      badge: "Deep Focus Engine",
      tab: "Timer",
      desc: "Scientifically calibrated 25/50 min focus cycles and full 3-Hour NTA-style mock exam timers to build peak exam stamina."
    },
    {
      icon: <Target className="w-6 h-6 text-purple-400" />,
      title: "Daily Goals & AI Mentor",
      badge: "IIT Productivity Score",
      tab: "Home",
      desc: "Set chapter & question targets. Daily AI Mentor reviews your pace and offers customized productivity tactics."
    },
    {
      icon: <LineChart className="w-6 h-6 text-emerald-400" />,
      title: "Mock Test Analyzer",
      badge: "Percentile Projector",
      tab: "Mock Tests",
      desc: "Track Physics, Chemistry & Math scores separately. Spot negative-marking patterns and simulate your JEE percentile."
    },
    {
      icon: <Users className="w-6 h-6 text-sky-400" />,
      title: "JEE Manthan Community",
      badge: "Peer Discussion & Notes",
      tab: "Community",
      desc: "Connect directly with fellow serious aspirants and top rankers on Telegram to share notes, tips, and drive."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Cloud Sync & Study Streak",
      badge: "Zero Data Loss",
      tab: "Home",
      desc: "Persistent real-time synchronization keeps your goals, solved questions, and daily streaks safe across all devices."
    }
  ];

  return (
    <div className="relative w-full min-h-screen text-slate-100 overflow-hidden font-sans">
      
      {/* FULL-PAGE FIXED 3D ANTIGRAVITY SCENE */}
      <Suspense fallback={<div className="fixed inset-0 bg-[#070b19]" />}>
        <LandingScene3D />
      </Suspense>

      {/* Subtle Background Glow Overlays across the page */}
      <div className="fixed -top-40 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 -right-40 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative z-10 min-h-[85vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-16 md:pt-20 pb-20 max-w-5xl mx-auto">
        
        {/* Dynamic Antigravity Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-6 max-w-5xl"
        >
          Crack JEE With{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 filter drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">
            3D Clarity
          </span>{" "}
          &amp; AI Power
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-lg md:text-2xl text-slate-300 max-w-3xl mb-10 leading-relaxed font-light drop-shadow-sm"
        >
          The complete operating system for serious JEE aspirants. Master complex Physics, Chemistry &amp; Math concepts with instant LaTeX solutions and AI productivity coaching.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto"
        >
          <Button
            onClick={() => handleFeatureClick("Home")}
            className="px-8 py-4 text-base md:text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 border border-indigo-400/40"
          >
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            Enter JEE Manthan Portal
            <ArrowRight className="w-5 h-5" />
          </Button>

          <a
            href="https://t.me/+-k4CAtxqAudkZGY1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button
              variant="secondary"
              className="px-6 py-4 text-base md:text-lg bg-slate-900/80 hover:bg-slate-800/80 text-slate-200 border border-slate-700/80 rounded-2xl backdrop-blur-xl transition-all flex items-center gap-2 hover:border-cyan-500/40 shadow-lg"
            >
              <Send className="w-5 h-5 text-cyan-400" />
              Join Telegram Community
            </Button>
          </a>
        </motion.div>

        {/* Live Metrics Floating Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-14 w-full max-w-4xl text-left"
        >
          <div className="bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-blue-500/40 transition-colors">
            <div className="text-2xl md:text-3xl font-black text-blue-400">24/7</div>
            <div className="text-xs md:text-sm text-slate-400 font-medium mt-1">Instant Doubt Support</div>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-cyan-500/40 transition-colors">
            <div className="text-2xl md:text-3xl font-black text-cyan-400">0.4s</div>
            <div className="text-xs md:text-sm text-slate-400 font-medium mt-1">Instant Solve Time</div>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-purple-500/40 transition-colors">
            <div className="text-2xl md:text-3xl font-black text-purple-400">LaTeX</div>
            <div className="text-xs md:text-sm text-slate-400 font-medium mt-1">Math &amp; Diagram Engine</div>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-emerald-500/40 transition-colors">
            <div className="text-2xl md:text-3xl font-black text-emerald-400">100%</div>
            <div className="text-xs md:text-sm text-slate-400 font-medium mt-1">Free For Students</div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mt-12 flex flex-col items-center gap-2 text-xs text-slate-400 uppercase tracking-widest pointer-events-none"
        >
          <span>Scroll to Explore Features</span>
          <div className="w-5 h-8 rounded-full border border-slate-700 flex justify-center p-1">
            <div className="w-1.5 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* FEATURE SHOWCASE SECTION WITH SCROLL REVEAL ANIMATIONS */}
      <section className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-cyan-400 font-semibold text-xs md:text-sm tracking-wider uppercase bg-cyan-950/60 border border-cyan-500/30 px-4 py-1.5 rounded-full backdrop-blur-md">
            Engineered For Serious Aspirants
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-5 tracking-tight">
            Everything You Need To Crack IIT JEE
          </h2>
          <p className="text-slate-300 text-base md:text-lg mt-4 font-light">
            Built from scratch to eliminate distractions and supercharge your study hours with deep focus tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => handleFeatureClick(feature.tab)}
              className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-7 shadow-xl border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-850/80 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-cyan-400 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed font-light">
                  {feature.desc}
                </p>
              </div>

              <div 
                className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-sm font-semibold text-cyan-400 group-hover:text-cyan-300"
              >
                <span>Launch {feature.title.replace("AI ", "")}</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE LIVE DOUBT SOLVER PREVIEW WITH SCROLL REVEAL */}
      <section className="relative z-10 py-16 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="bg-slate-900/70 backdrop-blur-2xl text-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-[0_10px_50px_rgba(0,0,0,0.5)] border border-slate-800/90"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-wider uppercase mb-2">
                <Brain className="w-4 h-4" />
                Live AI Engine Demonstration
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white">
                How JEE Manthan Solves Complex Questions
              </h3>
            </div>
            
            {/* Subject Selector */}
            <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 gap-1 self-start md:self-auto">
              {(["physics", "math", "chemistry"] as const).map((subject) => (
                <button
                  key={subject}
                  onClick={() => setActivePreviewTab(subject)}
                  className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold capitalize transition-all ${
                    activePreviewTab === subject
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Steps & Solution */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-sm font-mono text-cyan-300">
                {previews[activePreviewTab].question}
              </div>

              <div className="space-y-2.5">
                {previews[activePreviewTab].steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80 text-sm text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </motion.div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleFeatureClick("Doubt Solver")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-blue-600/30"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  Try Doubt Solver Now
                </Button>
              </div>
            </div>

            {/* Generated Diagram Preview */}
            <div className="lg:col-span-5 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Auto-Generated Visual Diagram</span>
                <span className="text-emerald-400 font-mono text-[10px]">DIAGRAM ENGINE</span>
              </div>
              <img
                src={previews[activePreviewTab].diagram}
                alt="Visual Diagram Preview"
                className="w-full h-52 object-cover"
                loading="lazy"
              />
              <div className="p-3 text-[11px] text-slate-400 font-sans italic bg-slate-950 text-center">
                Visual illustrations and graphs are automatically created when diagrams are needed.
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FINAL CALL TO ACTION WITH GLOWING PORTAL */}
      <section className="relative z-10 py-20 px-4 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-[0_0_50px_rgba(79,70,229,0.2)] border border-indigo-500/30 relative overflow-hidden"
        >
          <div className="inline-flex p-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl text-blue-400 mb-6 shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Ready to Take Your JEE Preparation to IIT Level?
          </h2>
          <p className="text-slate-300 text-base md:text-lg mb-8 max-w-xl mx-auto font-light">
            Join thousands of engineering aspirants organizing their preparation, crushing doubts, and staying on track.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={() => handleFeatureClick("Home")}
              className="px-8 py-4 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 border border-blue-400/30"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              Enter JEE Manthan Portal
            </Button>
            <a
              href="https://t.me/+-k4CAtxqAudkZGY1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="secondary"
                className="px-6 py-4 text-base font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-cyan-400" />
                Telegram Community
              </Button>
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
