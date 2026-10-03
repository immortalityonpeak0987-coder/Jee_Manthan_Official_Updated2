import React, { useState } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { CheckCircle2, MessageSquare, Star } from "lucide-react";
import { cn } from "./utils";
import { Users, ExternalLink } from "lucide-react";

export function Community() {
  const links = [
    { title: "Main Group", url: "https://t.me/+-k4CAtxqAudkZGY1", description: "Join our main discussion group" },
    { title: "Main Channel", url: "https://t.me/+FjXLVgrzQ49mNTZl", description: "Get the latest official announcements" },
    { title: "Manthan Fun Zone", url: "https://t.me/+mFAqvnyAnS4zYmVl", description: "Relax and chill with other aspirants" }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Community</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {links.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full mb-6 mx-auto bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{link.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{link.description}</p>
              
              <div className="mt-auto inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-500">
                Join <ExternalLink className="w-4 h-4 ml-1" />
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}

export function Feedback() {
  const [submitted, setSubmitted] = useState(() => {
    return localStorage.getItem("jee_feedback_submitted") === "true";
  });
  const [rating, setRating] = useState(0);
  const [thoughts, setThoughts] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback: thoughts })
      });
      setSubmitted(true);
      localStorage.setItem("jee_feedback_submitted", "true");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setRating(0);
    setThoughts("");
    localStorage.removeItem("jee_feedback_submitted");
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto p-12 text-center flex flex-col items-center justify-center border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h2>
        <p className="text-gray-600 dark:text-slate-300">Your feedback helps us improve JEE Manthan.</p>
        <Button onClick={handleReset} className="mt-6" variant="outline">Submit another response</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-8">
        <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Feedback</h2>
      </div>
      
      <Card className="p-8 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Rate your experience</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star className={cn("w-8 h-8", rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-slate-600")} />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Share your thoughts</label>
            <textarea
              required
              rows={4}
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              placeholder="What do you like? What can we improve?"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          
          <Button type="submit" className="w-full py-3" disabled={rating === 0 || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export function Owners() {
  const owners = [
    { 
      name: "Silent Killer", 
      link: "http://t.me/Immortality_on_Peak", 
      handle: "@Immortality_on_Peak",
      color: "from-purple-500 to-indigo-600" 
    },
    { 
      name: "Saransh", 
      link: "https://t.me/CallmeSrx", 
      handle: "@CallmeSrx",
      color: "from-blue-500 to-cyan-500" 
    },
    { 
      name: "Blue Flash", 
      link: "https://t.me/povego", 
      handle: "@povego",
      color: "from-sky-400 to-blue-600" 
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Meet the Creators</h2>
        <p className="text-gray-600 dark:text-slate-400 mt-3">The team working hard to build tools for aspirants.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {owners.map((owner) => (
          <a
            key={owner.name}
            href={owner.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <Card className="p-8 pb-10 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
              <div className={cn("w-20 h-20 rounded-full mb-6 mx-auto bg-gradient-to-br flex items-center justify-center shadow-lg", owner.color)}>
                <span className="text-2xl font-bold text-white tracking-widest uppercase">{owner.name.substring(0, 2)}</span>
              </div>
              <h3 className={cn("text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r drop-shadow-sm group-hover:scale-105 transition-transform", owner.color, "font-[cursive]")}>
                {owner.name}
              </h3>
              {owner.handle && (
                <span className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200/60 dark:border-blue-800/60">
                  {owner.handle}
                </span>
              )}
              <p className="mt-4 text-sm text-gray-500 dark:text-slate-400 font-medium">Click to message on Telegram</p>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
