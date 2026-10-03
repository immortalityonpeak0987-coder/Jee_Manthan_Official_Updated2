import React, { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { cn } from "./utils";
import { Plus, TrendingUp, Trophy, Calendar, Target, Award } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface MockTest {
  id: string;
  name: string;
  date: string;
  marks: number;
  totalMarks: number;
  physics: number;
  chemistry: number;
  maths: number;
}

export function MockTracker() {
  const [tests, setTests] = useState<MockTest[]>(() => {
    const saved = localStorage.getItem("jee_mock_tests");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    marks: "",
    totalMarks: "300",
    physics: "",
    chemistry: "",
    maths: ""
  });

  useEffect(() => {
    localStorage.setItem("jee_mock_tests", JSON.stringify(tests));
  }, [tests]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTest: MockTest = {
      id: Date.now().toString(),
      name: formData.name,
      date: formData.date,
      marks: Number(formData.marks),
      totalMarks: Number(formData.totalMarks),
      physics: Number(formData.physics),
      chemistry: Number(formData.chemistry),
      maths: Number(formData.maths),
    };
    setTests([...tests, newTest].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setIsAdding(false);
    setFormData({ ...formData, name: "", marks: "", physics: "", chemistry: "", maths: "" });
  };

  const chartData = tests.map(t => ({
    name: t.name,
    Marks: t.marks,
    Physics: t.physics,
    Chemistry: t.chemistry,
    Maths: t.maths,
    date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }));

  const bestScore = tests.length > 0 ? Math.max(...tests.map(t => t.marks)) : 0;
  const avgScore = tests.length > 0 ? Math.round(tests.reduce((acc, t) => acc + t.marks, 0) / tests.length) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
            Mock Test Tracker
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Track your progress and analyze subject-wise performance.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-5 h-5 mr-2" /> Add Test Result
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-gray-200 dark:border-slate-800 flex items-center bg-gradient-to-br from-white to-orange-50 dark:from-slate-900 dark:to-orange-950/20">
          <div className="p-4 bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 rounded-2xl mr-6">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Highest Score</p>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{bestScore}</p>
          </div>
        </Card>
        
        <Card className="p-6 border-gray-200 dark:border-slate-800 flex items-center bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
          <div className="p-4 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl mr-6">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Average Score</p>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{avgScore}</p>
          </div>
        </Card>
      </div>

      {isAdding && (
        <Card className="p-6 border-blue-200 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800/80">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Add New Record
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Test Name/ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AITS-1"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Total Marks Obtained</label>
                <input
                  type="number"
                  required
                  placeholder="Total Score"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.marks}
                  onChange={(e) => setFormData({...formData, marks: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Out of (Max Marks)</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                />
              </div>
            </div>
            
            <div className="border-t border-blue-100 dark:border-slate-700 pt-4 mt-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Subject-wise Score (Optional but recommended)</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder="Physics"
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    value={formData.physics}
                    onChange={(e) => setFormData({...formData, physics: e.target.value})}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Chemistry"
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    value={formData.chemistry}
                    onChange={(e) => setFormData({...formData, chemistry: e.target.value})}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Maths"
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    value={formData.maths}
                    onChange={(e) => setFormData({...formData, maths: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit">Save Record</Button>
            </div>
          </form>
        </Card>
      )}

      {tests.length > 0 ? (
        <Card className="p-6 border-gray-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Performance Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#f8fafc' }}
                />
                <Line type="monotone" dataKey="Marks" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Total Marks" />
                <Line type="monotone" dataKey="Physics" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} name="Physics" />
                <Line type="monotone" dataKey="Chemistry" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} name="Chemistry" />
                <Line type="monotone" dataKey="Maths" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} name="Maths" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card className="p-12 border-gray-200 dark:border-slate-800 border-dashed bg-gray-50 dark:bg-slate-800/40 flex items-center justify-center text-center">
          <div>
            <Award className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400 font-medium">No mock test records yet.</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1 mb-4">Add your first test score to visualize your progress.</p>
          </div>
        </Card>
      )}

      {tests.length > 0 && (
        <Card className="overflow-hidden border-gray-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Test Date & Name</th>
                  <th className="px-6 py-4">Physics</th>
                  <th className="px-6 py-4">Chemistry</th>
                  <th className="px-6 py-4">Maths</th>
                  <th className="px-6 py-4">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {tests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{test.name}</div>
                      <div className="text-gray-500 dark:text-slate-400 text-xs mt-0.5 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(test.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-slate-300">
                      {test.physics || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-slate-300">
                      {test.chemistry || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-slate-300">
                      {test.maths || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-600 dark:text-blue-400">{test.marks} <span className="font-normal text-gray-400 text-xs">/ {test.totalMarks}</span></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
