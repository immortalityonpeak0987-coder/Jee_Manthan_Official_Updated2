import React, { useState } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, X } from "lucide-react";

interface AuthProps {
  onLogin: (username: string) => void;
  onClose?: () => void;
}

export function Auth({ onLogin, onClose }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 4);
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const trimmedUsername = username.trim();
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUsername, password })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Authentication failed");
      
      if (isLogin) {
        // Restore data to localStorage
        if (data.data) {
          for (const key in data.data) {
            localStorage.setItem(key, data.data[key]);
          }
        }
        localStorage.setItem("jee_current_user", trimmedUsername);
        onLogin(trimmedUsername);
      } else {
        // Auto-login upon successful signup
        localStorage.setItem("jee_current_user", trimmedUsername);
        onLogin(trimmedUsername);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <Card className="w-full max-w-md p-8 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        
        {error && (
          <div className={`p-3 rounded-md text-sm mb-4 ${error.includes('created') ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!isLogin && password.length > 0 && (
              <div className="mt-2 flex gap-1 h-1.5 w-full">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-full flex-1 rounded-full ${
                      strength >= level
                        ? level === 1 ? 'bg-red-500' 
                          : level === 2 ? 'bg-orange-500' 
                          : level === 3 ? 'bg-yellow-500' 
                          : 'bg-green-500'
                        : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full py-3" disabled={loading || (!isLogin && strength < 2)}>
            {loading ? "Please wait..." : (isLogin ? "Log In" : "Sign Up")}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </Card>
    </div>
  );
}
