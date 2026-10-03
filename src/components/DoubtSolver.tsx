import React, { useState, useRef, useEffect } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { cn } from "./utils";
import { ChatMessage } from "../types";
import { 
  Send, 
  ImagePlus, 
  Loader2, 
  MessageSquareText, 
  X, 
  History as HistoryIcon, 
  Plus, 
  Trash2, 
  Clock, 
  ChevronRight,
  FileQuestion,
  Sparkles,
  ArrowRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

const SEVENTEEN_HOURS = 17 * 60 * 60 * 1000;

export interface DoubtHistoryItem {
  id: string;
  title: string;
  timestamp: number;
  preview: string;
  hasImage?: boolean;
  messages: ChatMessage[];
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "ai",
  text: "Hi! I'm your Doubt Solver. Ask me any Physics, Chemistry, or Math question, or upload an image of your problem to get instant step-by-step solutions with diagrams!",
};

const SAMPLE_QUESTIONS = [
  "Find the maximum range and time of flight of a projectile launched with velocity u at angle θ.",
  "Calculate the pH of 0.01 M CH3COOH solution given Ka = 1.8 × 10^-5.",
  "Evaluate the definite integral: ∫ from 0 to π/2 of (sin x)/(sin x + cos x) dx."
];

function ScientificDiagramViewer({ src, alt }: { src?: string; alt?: string }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If URL points to image.pollinations.ai, rewrite to internal /api/diagram
  let finalSrc = src || "";
  if (finalSrc.includes("pollinations.ai")) {
    const match = finalSrc.match(/\/prompt\/([^?&]+)/);
    const promptText = match ? decodeURIComponent(match[1]) : (alt || "physics diagram");
    finalSrc = `/api/diagram?prompt=${encodeURIComponent(promptText)}`;
  }

  return (
    <span className="block my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl max-w-xl">
      <span className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <span className="flex items-center gap-1.5 font-bold text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          {alt || "Vector Scientific Diagram"}
        </span>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
          VECTOR DIAGRAM
        </span>
      </span>
      <span className="relative p-2 flex items-center justify-center min-h-[200px] bg-slate-950 block">
        {isLoading && (
          <span className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-950/90 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-xs font-mono">Rendering vector diagram...</span>
          </span>
        )}
        {!hasError ? (
          <img
            src={finalSrc}
            alt={alt || "Scientific Diagram"}
            className="w-full h-auto max-h-80 object-contain rounded-lg"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : (
          <span className="p-6 block text-center text-slate-300">
            <span className="text-xs text-cyan-300 font-mono mb-2 block">Diagram: {alt || "Physics Diagram"}</span>
            <span className="text-xs text-slate-400 block">Vector representation generated based on scientific principles.</span>
          </span>
        )}
      </span>
    </span>
  );
}

export function DoubtSolver() {
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => Date.now().toString());
  const [activeView, setActiveView] = useState<"chat" | "history">("chat");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Stored history of last 10 conversations
  const [history, setHistory] = useState<DoubtHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("jee_doubt_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, 10);
      }
    } catch (e) {}
    return [];
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const lastReset = parseInt(localStorage.getItem("jee_doubt_last_reset") || "0", 10);
    if (Date.now() - lastReset > SEVENTEEN_HOURS) {
      localStorage.setItem("jee_doubt_last_reset", Date.now().toString());
      return [WELCOME_MESSAGE];
    }
    
    const saved = localStorage.getItem("jee_doubt_messages");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [WELCOME_MESSAGE];
  });

  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("jee_doubt_messages", JSON.stringify(messages));
    if (!localStorage.getItem("jee_doubt_last_reset")) {
      localStorage.setItem("jee_doubt_last_reset", Date.now().toString());
    }
  }, [messages]);

  // Smooth scroll down automatically whenever new messages arrive or user asks 2nd, 3rd question
  useEffect(() => {
    if (activeView === "chat") {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeView]);

  // Save conversation into history (keeps up to last 10)
  const saveToHistory = (newMsgs: ChatMessage[], hasImg?: boolean) => {
    const userMsgs = newMsgs.filter(m => m.role === "user");
    if (userMsgs.length === 0) return;
    const firstUserMsg = userMsgs[0];
    const rawText = firstUserMsg.text?.trim() || (firstUserMsg.imageBase64 ? "Image Problem" : "Doubt Question");
    const title = rawText.length > 42 ? rawText.substring(0, 42) + "..." : rawText;
    const preview = rawText.length > 90 ? rawText.substring(0, 90) + "..." : rawText;

    const updatedSession: DoubtHistoryItem = {
      id: currentSessionId,
      title: title || "Physics/Math Problem",
      timestamp: Date.now(),
      preview,
      hasImage: hasImg || !!firstUserMsg.imageBase64,
      messages: newMsgs
    };

    setHistory(prevHistory => {
      const filtered = prevHistory.filter(h => h.id !== currentSessionId);
      const newHistory = [updatedSession, ...filtered].slice(0, 10);
      try {
        localStorage.setItem("jee_doubt_history", JSON.stringify(newHistory));
      } catch (e) {}
      return newHistory;
    });
  };

  const handleStartNewChat = () => {
    if (messages.length > 1) {
      saveToHistory(messages);
    }
    const newId = Date.now().toString();
    setCurrentSessionId(newId);
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    removeImage();
    setActiveView("chat");
  };

  const handleLoadSession = (session: DoubtHistoryItem) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setActiveView("chat");
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem("jee_doubt_history", JSON.stringify(updated));
      } catch (e) {}
      if (updated.length === 0) {
        showToast("All deleted");
      } else {
        showToast("Doubt deleted successfully.");
      }
      return updated;
    });

    if (currentSessionId === id) {
      setCurrentSessionId(Date.now().toString());
      setMessages([WELCOME_MESSAGE]);
    }
  };

  // Delete all saved doubts and clear chat
  const handleClearAll = () => {
    setHistory([]);
    setMessages([WELCOME_MESSAGE]);
    try {
      localStorage.removeItem("jee_doubt_history");
      localStorage.removeItem("jee_doubt_messages");
      localStorage.setItem("jee_doubt_last_reset", Date.now().toString());
    } catch (e) {
      console.error(e);
    }
    setCurrentSessionId(Date.now().toString());
    setInput("");
    removeImage();
    setActiveView("chat");
    showToast("All deleted");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const sendMessage = async (customText?: string) => {
    const textToSend = typeof customText === "string" ? customText : input;
    if (!textToSend.trim() && !imageFile) return;

    const userText = textToSend;
    const currentImgUrl = imagePreview;
    const hadImage = !!imageFile || !!currentImgUrl;
    
    // Append user message in the same continuous normal chat stream
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
      imageBase64: currentImgUrl || undefined
    };
    
    const updatedWithUser = [...messages, newUserMsg];
    setMessages(updatedWithUser);
    setInput("");
    
    let base64Data: string | undefined;
    let mimeType: string | undefined;
    
    if (imageFile) {
      base64Data = await getBase64(imageFile);
      mimeType = imageFile.type;
      removeImage();
    }
    
    setIsTyping(true);
    try {
      const res = await fetch("/api/solve-doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          imageBase64: base64Data,
          mimeType: mimeType
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get solution");
      
      const aiResponseMsg: ChatMessage = {
        id: Date.now().toString() + "ans",
        role: "ai",
        text: data.solution,
      };
      const finalMessages = [...updatedWithUser, aiResponseMsg];
      setMessages(finalMessages);
      saveToHistory(finalMessages, hadImage);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString() + "err",
        role: "ai",
        text: `⚠️ **Error:** ${error.message || "Could not generate solution. Please try again."}`,
      };
      const finalWithErr = [...updatedWithUser, errorMsg];
      setMessages(finalWithErr);
      saveToHistory(finalWithErr, hadImage);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today, ${timeStr}`;
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  // Check if viewing a saved conversation from history
  const activeHistoryItem = history.find(h => h.id === currentSessionId);

  return (
    <section className="mb-20 max-w-4xl mx-auto w-full px-2 sm:px-4">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-950/60 rounded-xl mr-3 shrink-0">
            <MessageSquareText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Doubt Solver</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Ask Physics, Chemistry, Math doubts with step-by-step LaTeX &amp; diagrams</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Toggle Buttons */}
          <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setActiveView("chat")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5",
                activeView === "chat" 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs" 
                  : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveView("history")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5",
                activeView === "history" 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs" 
                  : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>Saved ({history.length})</span>
            </button>
          </div>

          {/* New Question Button */}
          <Button
            onClick={handleStartNewChat}
            variant="outline"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-slate-800"
            title="Start a fresh question topic"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New Chat</span>
          </Button>

          {/* Ek Sath Delete / Clear All Button */}
          <Button 
            variant="outline" 
            onClick={handleClearAll} 
            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-slate-800 flex items-center px-3 py-1.5 text-xs sm:text-sm font-bold shadow-xs"
            title="Delete all saved doubts and clear chat"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>Clear All</span>
          </Button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="mb-3 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200 font-bold ml-2">✕</button>
        </div>
      )}

      {/* SINGLE UNIFIED CHATTING CARD (Normal Chatting with Smooth Scrolling) */}
      <Card className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden h-[720px] transition-all relative">
        
        {/* Card Header Status Strip */}
        <div className="px-3 sm:px-6 py-2.5 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700/80 flex items-center justify-between text-xs text-gray-600 dark:text-slate-300 shrink-0">
          <div className="flex items-center gap-2 truncate">
            {activeView === "chat" ? (
              activeHistoryItem ? (
                <div className="flex items-center gap-1.5 truncate">
                  <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    Saved Doubt
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200 truncate">
                    {activeHistoryItem.title}
                  </span>
                </div>
              ) : (
                <span className="font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Doubt Session
                </span>
              )
            ) : (
              <span className="font-bold text-gray-800 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                <HistoryIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Saved Doubts History ({history.length}/10)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeView === "chat" ? (
              <button
                onClick={() => setActiveView("history")}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                title="View saved doubts list"
              >
                <HistoryIcon className="w-3.5 h-3.5" />
                <span>Saved ({history.length})</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Delete all saved doubts"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete All</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveView("chat")}
                  className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <MessageSquareText className="w-3.5 h-3.5" />
                  <span>Back to Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* VIEW 1: NORMAL CHAT SCROLLING FEED (Active when activeView === "chat") */}
        {activeView === "chat" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* NORMAL CHAT SCROLLING FEED */}
            <div className="flex-1 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col gap-5 overflow-y-auto scroll-smooth">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "rounded-2xl p-4 sm:p-5 shadow-xs transition-all",
                    msg.role === "user" 
                      ? "bg-blue-600 text-white self-end max-w-[90%] sm:max-w-[80%] rounded-br-sm shadow-blue-500/10" 
                      : "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 self-start w-full max-w-[98%] sm:max-w-[94%] border border-gray-200/90 dark:border-slate-700/80 rounded-bl-sm"
                  )}
                >
                  {msg.imageBase64 && (
                    <img 
                      src={msg.imageBase64} 
                      alt="Uploaded problem" 
                      className="rounded-lg mb-3 max-w-full h-auto max-h-80 border border-white/20 object-contain shadow-sm bg-white dark:bg-slate-900" 
                    />
                  )}
                  {msg.text && (
                    <div 
                      className={cn(
                        "leading-relaxed break-words w-full",
                        msg.role === "ai" 
                          ? "prose prose-sm md:prose-base prose-blue dark:prose-invert max-w-none overflow-x-auto text-gray-900 dark:text-slate-100" 
                          : "whitespace-pre-wrap font-medium text-sm sm:text-base"
                      )}
                    >
                      {msg.role === "ai" ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkMath, remarkGfm]} 
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            p: ({ children, node, ...props }: any) => {
                              const hasImage = node?.children?.some((child: any) => child.tagName === "img" || child.type === "image");
                              if (hasImage) {
                                return <span className="block my-3" {...props}>{children}</span>;
                              }
                              return <p className="mb-3 last:mb-0 leading-relaxed" {...props}>{children}</p>;
                            },
                            img: ({ src, alt }: any) => <ScientificDiagramViewer src={src} alt={alt} />,
                            code: ({ inline, className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || "");
                              if (!inline && match && (match[1] === "svg" || match[1] === "xml")) {
                                const codeStr = String(children).replace(/\n$/, "");
                                if (codeStr.trim().startsWith("<svg")) {
                                  return (
                                    <span 
                                      className="my-4 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2 flex justify-center shadow-lg block"
                                      dangerouslySetInnerHTML={{ __html: codeStr }} 
                                    />
                                  );
                                }
                              }
                              return <code className={className} {...props}>{children}</code>;
                            }
                          }}
                        >
                          {msg.text.replace(/\\\(/g, "$").replace(/\\\)/g, "$").replace(/\\\[/g, "$$").replace(/\\\]/g, "$$")}
                        </ReactMarkdown>
                      ) : (
                        msg.text
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Quick sample prompt chips if chat only has the welcome message */}
              {messages.length === 1 && (
                <div className="p-4 bg-white/80 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 rounded-2xl max-w-2xl mx-auto w-full my-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
                    Suggested Questions to Try:
                  </span>
                  <div className="flex flex-col gap-2">
                    {SAMPLE_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(q)}
                        className="p-3 text-xs sm:text-sm bg-gray-50 dark:bg-slate-700/60 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-300 border border-gray-200/80 dark:border-slate-600/60 rounded-xl text-gray-700 dark:text-slate-200 text-left transition-colors flex items-center justify-between group"
                      >
                        <span className="line-clamp-1">{q}</span>
                        <ArrowRight className="w-4 h-4 shrink-0 text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {isTyping && (
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 self-start p-4 rounded-2xl rounded-bl-sm flex items-center gap-3 shadow-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="animate-pulse font-medium text-sm">Solving problem with step-by-step clarity...</span>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            {/* Input Bar at Bottom */}
            <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shrink-0">
              {imagePreview && (
                <div className="relative inline-block mb-3 ml-2">
                  <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-lg border border-gray-300 dark:border-slate-700 shadow-sm" />
                  <button 
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-gray-800 hover:bg-red-500 transition-colors text-white rounded-full p-1 shadow-sm"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2 sm:gap-3 items-end">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 sm:p-3.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0"
                  title="Upload Problem Image"
                >
                  <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6" />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </button>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask any Physics, Chemistry, Math question or upload diagram..."
                  className="flex-1 max-h-32 min-h-[50px] w-full resize-none rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-3.5 py-3 text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xs"
                  rows={imagePreview ? 1 : 2}
                />
                
                <Button 
                  type="submit" 
                  disabled={isTyping || (!input.trim() && !imageFile)}
                  className="p-3 sm:p-3.5 w-12 sm:w-14 h-[50px] shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center"
                >
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 2: SAVED DOUBTS LIST (100% CARD WIDTH, ZERO OVERLAP EVER!) */}
        {activeView === "history" && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/50">
            {/* History Header Action Strip */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">Saved Doubts List</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">{history.length} of 10 conversations saved</p>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    title="Delete all saved doubts"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All</span>
                  </button>
                )}
                <Button
                  onClick={handleStartNewChat}
                  variant="outline"
                  className="px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-slate-800 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>New Doubt</span>
                </Button>
              </div>
            </div>

            {/* List of Saved Doubts */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-full p-8 text-gray-400 dark:text-slate-500">
                  <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-full mb-3 text-gray-300 dark:text-slate-600">
                    <FileQuestion className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">No saved conversations yet</h4>
                  <p className="text-xs text-gray-400 dark:text-slate-500 max-w-xs mb-4">
                    Whenever you solve doubts, your last 10 questions and solutions will appear here list-wise!
                  </p>
                  <Button
                    onClick={() => setActiveView("chat")}
                    className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Ask a Doubt Now
                  </Button>
                </div>
              ) : (
                history.map((item, idx) => {
                  const isSelected = currentSessionId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleLoadSession(item)}
                      className={cn(
                        "p-4 rounded-xl border text-left cursor-pointer transition-all bg-white dark:bg-slate-800/90 hover:border-blue-300 dark:hover:border-blue-500 shadow-xs flex flex-col gap-2",
                        isSelected ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950" : "border-gray-200 dark:border-slate-700"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded text-xs font-black shrink-0",
                            isSelected ? "bg-blue-600 text-white" : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                          )}>
                            #{idx + 1}
                          </span>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                            {item.title}
                          </h4>
                        </div>
                        <button
                          onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-slate-700 transition-colors shrink-0"
                          title="Delete this doubt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {item.preview}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700/60 text-xs text-gray-400 dark:text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTimestamp(item.timestamp)}
                          </span>
                          {item.hasImage && (
                            <span className="text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded font-semibold text-[11px]">
                              Image Attached
                            </span>
                          )}
                        </div>
                        <span className="flex items-center font-bold text-blue-600 dark:text-blue-400">
                          {isSelected ? "Active in Chat" : "Open Solution"} <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* List Footer with Ek Sath Delete */}
            {history.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs shrink-0">
                <span className="text-gray-500 dark:text-slate-400 font-medium">
                  {history.length} of 10 stored
                </span>
                <button
                  onClick={handleClearAll}
                  className="px-3.5 py-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-lg transition-colors flex items-center gap-1.5 border border-red-200 dark:border-red-900/50"
                  title="Delete all saved doubts"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All History</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}
