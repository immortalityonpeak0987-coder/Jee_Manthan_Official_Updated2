import React, { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { cn } from "./utils";
import { Goal } from "../types";
import { CheckCircle2, Circle, Clock, Plus, Target, Sparkles, AlertCircle, RotateCcw, XCircle, CircleDot } from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { ProductivityGraph } from "./ProductivityGraph";

const SEVENTEEN_HOURS = 17 * 60 * 60 * 1000;

export function DailyGoals() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const lastReset = parseInt(localStorage.getItem("jee_goals_last_reset") || "0", 10);
    if (Date.now() - lastReset > SEVENTEEN_HOURS) {
      localStorage.setItem("jee_goals_last_reset", Date.now().toString());
      localStorage.removeItem("jee_analysis");
      return [];
    }
    const saved = localStorage.getItem("jee_goals");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [task, setTask] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [subject, setSubject] = useState<Goal["subject"]>("Physics");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(() => {
    return localStorage.getItem("jee_analysis") || "";
  });
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("jee_goals", JSON.stringify(goals));
    if (!localStorage.getItem("jee_goals_last_reset")) {
      localStorage.setItem("jee_goals_last_reset", Date.now().toString());
    }
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("jee_analysis", analysis);
  }, [analysis]);

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || !startTime || !endTime) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      task,
      startTime,
      endTime,
      status: "pending",
      subject,
    };

    setGoals([...goals, newGoal]);
    setTask("");
    setStartTime("");
    setEndTime("");
    setSubject("Physics");
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        if (g.status === "pending") return { ...g, status: "completed" };
        if (g.status === "completed") return { ...g, status: "half" };
        if (g.status === "half") return { ...g, status: "not" };
        return { ...g, status: "pending" };
      })
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all tasks?")) {
      setGoals([]);
      setAnalysis("");
      localStorage.removeItem("jee_goals");
      localStorage.removeItem("jee_analysis");
      localStorage.setItem("jee_goals_last_reset", Date.now().toString());
    }
  };

  const getAnalysis = async () => {
    if (goals.length === 0) return;
    setIsAnalyzing(true);
    setError("");
    
    try {
      const response = await fetch("/api/analyze-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze");
      
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const progress = goals.length > 0 
    ? Math.round((goals.reduce((acc, g) => acc + (g.status === "completed" ? 1 : g.status === "half" ? 0.5 : 0), 0) / goals.length) * 100) 
    : 0;

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Target className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Daily Goals & Timeline</h2>
        </div>
        <Button variant="outline" onClick={handleReset} className="text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 flex items-center px-3 py-1.5 text-sm h-auto">
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Reset Tasks
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input and List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6 bg-white/50 dark:bg-slate-900/80 backdrop-blur-sm border-gray-200 dark:border-slate-800">
            <form onSubmit={addGoal} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="What to study today? (e.g. HC Verma Rotational Dynamics)"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  required
                />
                <select 
                  className="px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white min-w-[140px]"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Goal["subject"])}
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-4 flex-1">
                  <input
                    type="time"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                  <span className="self-center text-gray-400 dark:text-slate-500">to</span>
                  <input
                    type="time"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="py-3 px-8 whitespace-nowrap min-w-[120px]">
                  <Plus className="w-5 h-5 mr-1" /> Add Goal
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-2 border-transparent bg-transparent shadow-none">
            {goals.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-slate-500 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                <p>No goals set for today. Plan your day out to crack JEE!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {goals.map((goal) => (
                  <motion.li
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={goal.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md group",
                      goal.status === "completed" ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800/40" :
                      goal.status === "half" ? "bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/40" :
                      goal.status === "not" ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40" :
                      "bg-white dark:bg-slate-800/90 border-gray-200 dark:border-slate-700"
                    )}
                    onClick={() => toggleGoal(goal.id)}
                  >
                    <div className="flex items-center gap-4">
                      <button className="focus:outline-none shrink-0">
                        {goal.status === "completed" && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                        {goal.status === "half" && <CircleDot className="w-6 h-6 text-orange-500" />}
                        {goal.status === "not" && <XCircle className="w-6 h-6 text-red-500" />}
                        {goal.status === "pending" && <Circle className="w-6 h-6 text-gray-300 dark:text-slate-600 hover:text-blue-500 transition-colors" />}
                      </button>
                      <div>
                        <p className={cn("font-medium text-lg", 
                          goal.status === "completed" ? "text-gray-400 dark:text-slate-500 line-through" :
                          goal.status === "not" ? "text-gray-400 dark:text-slate-500 line-through" :
                          "text-gray-900 dark:text-slate-100"
                        )}>
                          {goal.task}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-slate-400 mt-1 gap-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider",
                            goal.subject === "Physics" ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300" :
                            goal.subject === "Chemistry" ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" :
                            goal.subject === "Mathematics" ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300" :
                            "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                          )}>
                            {goal.subject}
                          </span>
                          <div className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-blue-500" />
                            <span>{goal.startTime} - {goal.endTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}
                      className="text-gray-400 hover:text-red-500 px-3 py-1 bg-white dark:bg-slate-700 rounded shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Right Column: Progress & Analysis */}
        <div className="flex flex-col gap-6">
          <Card className="p-6 border-gray-200 dark:border-slate-800 overflow-hidden relative">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
              End of Day Analysis
            </h3>
            
            <div className="mb-8">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-600 dark:text-slate-300">Daily Progress</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <Button 
              className="w-full py-4 text-white font-medium shadow-md group relative overflow-hidden"
              onClick={getAnalysis}
              disabled={isAnalyzing || goals.length === 0}
            >
              <div className="absolute inset-0 bg-blue-600 group-hover:bg-blue-700 transition-colors"></div>
              <span className="relative z-10 flex items-center justify-center">
                {isAnalyzing ? (
                  <span className="animate-pulse">Analyzing Routine...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Deep AI Analysis
                  </>
                )}
              </span>
            </Button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start text-sm">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
          </Card>

          {analysis && (
            <Card className="p-6 border-blue-100 dark:border-blue-900/50 bg-blue-50/30 dark:bg-slate-800/60 w-full max-h-[500px] overflow-y-auto">
              <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white border-b border-blue-100 dark:border-slate-700 pb-2 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" /> AI Feedback
              </h4>
              <div 
                className="text-gray-700 dark:text-slate-200 leading-relaxed text-sm prose prose-blue dark:prose-invert"
              >
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      <ProductivityGraph todayProgress={progress} />
    </section>
  );
}
