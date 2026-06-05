'use client';

import React from 'react';
import { useVisitors } from '@/context/VisitorContext';
import { Activity, CircleDot, Clock } from 'lucide-react';

export default function RecentActivity() {
  const { activityLogs, isLoaded } = useVisitors();

  const getRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const isCheckIn = (text: string) => {
    return text.includes('checked in');
  };

  const isPreRegister = (text: string) => {
    return text.includes('Pre-registered');
  };

  if (!isLoaded) {
    return (
      <div className="neo-card p-6 bg-white dark:bg-zinc-950 min-h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <div className="h-6 w-6 rounded-full border-2 border-zinc-300 border-t-zinc-800 animate-spin"></div>
          <p className="text-xs">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card p-6 bg-white dark:bg-zinc-950 flex flex-col h-full">
      <div className="flex items-center justify-between border-b-2 border-zinc-100 dark:border-zinc-900 pb-4 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-500" />
          Live Campus Feed
        </h3>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 animate-pulse">
          Live Ticker
        </span>
      </div>

      {activityLogs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-10">
          <Clock className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-xs">No recent activity logs.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[350px] pr-2">
          {activityLogs.slice(0, 10).map((log, index) => {
            const checkedIn = isCheckIn(log.text);
            const preRegistered = isPreRegister(log.text);
            
            let colorClass = 'text-zinc-400';
            if (checkedIn) colorClass = 'text-emerald-500';
            else if (preRegistered) colorClass = 'text-blue-500';
            else colorClass = 'text-amber-500'; // checked out

            return (
              <div key={log.id} className="flex gap-3 text-xs items-start group">
                <div className="mt-0.5 relative flex items-center justify-center">
                  <CircleDot className={`h-3.5 w-3.5 ${colorClass} fill-current`} />
                  {index < activityLogs.length - 1 && (
                    <div className="absolute top-4 bottom-[-16px] w-[2px] bg-zinc-200 dark:bg-zinc-800 pointer-events-none left-1.5"></div>
                  )}
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">
                    {log.text}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {getRelativeTime(log.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
