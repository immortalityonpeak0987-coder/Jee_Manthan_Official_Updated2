import React, { useMemo } from 'react';
import { Card } from './Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

interface ProductivityData {
  date: string;
  completion: number;
}

export function ProductivityGraph({ todayProgress }: { todayProgress: number }) {
  const data = useMemo(() => {
    const historyString = localStorage.getItem("jee_productivity_history");
    let history: ProductivityData[] = [];
    if (historyString) {
      try {
        history = JSON.parse(historyString);
      } catch (e) {}
    }
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const lastReset = parseInt(localStorage.getItem("jee_productivity_reset") || "0", 10);
    if (!lastReset || Date.now() - lastReset > WEEK_MS) {
      localStorage.setItem("jee_productivity_reset", Date.now().toString());
      history = [];
    }
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const existingIndex = history.findIndex(h => h.date === todayStr);
    
    if (existingIndex > -1) {
      history[existingIndex].completion = todayProgress;
    } else {
      history.push({ date: todayStr, completion: todayProgress });
    }
    
    if (history.length > 7) {
      history = history.slice(history.length - 7);
    }
    
    localStorage.setItem("jee_productivity_history", JSON.stringify(history));
    if (history.length === 0) {
      return [{ date: todayStr, completion: todayProgress }];
    }
    return history;
  }, [todayProgress]);

  return (
    <Card className="mt-8 p-6 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <h3 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
        <Activity className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
        Weekly Productivity Analysis
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #334155', 
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
              }}
              cursor={{ fill: 'rgba(56, 189, 248, 0.08)' }}
              formatter={(value: any) => [`${value}%`, 'Tasks Completed']}
            />
            <Bar dataKey="completion" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
