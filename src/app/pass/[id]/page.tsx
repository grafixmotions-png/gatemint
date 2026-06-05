'use client';

import React, { use } from 'react';
import { useVisitors } from '@/context/VisitorContext';
import VisitorPass from '@/components/VisitorPass';
import { AlertTriangle, Search, Home } from 'lucide-react';
import Link from 'next/link';

interface PassPageProps {
  params: Promise<{ id: string }>;
}

export default function PassPage({ params }: PassPageProps) {
  const { id } = use(params);
  const { visitors, isLoaded } = useVisitors();

  // Search by UUID id or human-readable visitorId (e.g. GM-2026-1234)
  const visitor = visitors.find(
    v => v.id === id || v.visitorId === id || v.visitorId.toLowerCase() === id.toLowerCase()
  );

  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-black/95">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <div className="h-8 w-8 rounded-full border-2 border-zinc-300 border-t-zinc-800 animate-spin"></div>
          <p className="text-xs">Loading campus pass...</p>
        </div>
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-black/95">
        <div className="max-w-md w-full neo-card bg-white dark:bg-zinc-950 p-8 border-2 border-red-500 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.2)] text-center space-y-6">
          <div className="inline-flex h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/50 items-center justify-center text-red-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-black text-black dark:text-white">Pass Not Found</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              The visitor pass with reference ID <span className="font-mono font-bold text-red-500">"{id}"</span> could not be found or has expired.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/register"
              className="inline-flex items-center justify-center text-xs font-bold h-10 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-950 dark:hover:bg-zinc-100 transition-all"
            >
              <Search className="mr-2 h-3.5 w-3.5" /> Register New Visitor
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center text-xs font-bold h-10 border-2 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white bg-transparent text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all"
            >
              <Home className="mr-2 h-3.5 w-3.5" /> Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black/95 py-12 px-4 sm:px-6 lg:px-8">
      <VisitorPass visitor={visitor} />
    </div>
  );
}
