import React, { useState, useEffect } from 'react';
import { Award, Zap, BookOpen, Star, MessageSquare } from 'lucide-react';
import API from '../services/api';

const Leaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const { data } = await API.get('/auth/leaderboard');
        setRankings(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="h-8 w-8 text-amber-500 animate-pulse" />
          Campus Leaderboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Top contributors sharing resource files and helping peers across Ethiopian Universities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Rankings List */}
        <div className="glass-panel p-5 rounded-2xl md:col-span-2 space-y-4">
          <h3 className="font-semibold text-slate-800 dark:text-white text-base">Top 10 Contributors</h3>
          
          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            </div>
          ) : rankings.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-12">No rankings available yet.</p>
          ) : (
            <div className="space-y-2">
              {rankings.map((student, index) => {
                let rankBadgeClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                if (index === 0) rankBadgeClass = "bg-amber-400 text-slate-950 font-bold";
                if (index === 1) rankBadgeClass = "bg-slate-300 text-slate-950 font-bold";
                if (index === 2) rankBadgeClass = "bg-amber-600 text-white font-bold";

                return (
                  <div
                    key={student._id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs ${rankBadgeClass}`}>
                      {index + 1}
                    </span>
                    <img src={student.avatar} alt={student.name} className="h-9 w-9 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate dark:text-white">{student.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold truncate">
                        {student.university?.abbreviation || 'AAU'} • {student.badges[0] || 'Contributor'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Zap className="h-4.5 w-4.5 fill-amber-500/25" />
                        {student.points} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Earning Guidelines */}
        <div className="glass-panel p-5 rounded-2xl h-fit space-y-4">
          <h3 className="font-semibold text-slate-800 dark:text-white text-base">How to Earn Points?</h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex gap-3">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-2 text-blue-600 dark:text-blue-400 shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold dark:text-white">Upload Approved Resource (+15 pts)</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Share lecture slides, exams, or projects. Verified posts reward maximum points.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-2 text-emerald-600 dark:text-emerald-400 shrink-0">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold dark:text-white">Participate in Forum (+5 pts)</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Start discussion topics or reply to questions. Building community is rewarded.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-2 text-amber-600 dark:text-amber-400 shrink-0">
                <Star className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold dark:text-white">Comment / Rate Resource (+3 pts)</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Help others know if a document is helpful. Leave honest reviews.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
