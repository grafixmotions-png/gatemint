'use client';

import React from 'react';
import Link from 'next/link';
import { useVisitors } from '../context/VisitorContext';
import { 
  QrCode, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  Sparkles,
  ClipboardList,
  CheckCircle2,
  Clock
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

export default function Home() {
  const { visitors, isLoaded } = useVisitors();

  // Calculate live statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const visitorsToday = visitors.filter(v => v.visitDate === todayStr);
  
  const totalToday = visitorsToday.length;
  const checkedInToday = visitorsToday.filter(v => v.status === 'Checked In').length;
  const checkedOutToday = visitorsToday.filter(v => v.status === 'Checked Out').length;
  const currentlyInside = visitors.filter(v => v.status === 'Checked In').length;

  const features = [
    {
      icon: ClipboardList,
      title: 'Simple Pre-Registration',
      description: 'Visitors can register online prior to their visit. Captures all relevant details including host, department, and purpose.'
    },
    {
      icon: QrCode,
      title: 'Instant QR Pass',
      description: 'Auto-generates a high-quality vector QR code entry pass. Printable and downloadable directly from the web.'
    },
    {
      icon: ShieldCheck,
      title: 'Front Desk Validation',
      description: 'Streamlined console for receptionists to search and validate passes via simulation or physical scanner emulation.'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Insights',
      description: 'Rich metrics, graphs, and trends detailing campus entry spikes, peak hours, and visitor distributions.'
    }
  ];

  return (
    <div className="flex-1 bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center border-b-2 border-zinc-100 dark:border-zinc-900">
        {/* Tag badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-6 border border-emerald-200 dark:border-emerald-900">
          <Sparkles className="h-3 w-3" />
          GateMint Open Day Presentation Demo
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black dark:text-white leading-[1.1] mb-6">
          Smart Visitor Pass <br className="hidden sm:inline" />
          <span className="text-emerald-500 underline decoration-4 decoration-emerald-500/30">
            Operations Platform
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400 mb-10 font-medium">
          Say goodbye to messy paper visitor logs. Smart visitor registration, instant QR check-in, and live campus entry analytics built for modern institutions.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center text-base font-bold h-12 px-8 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-950 dark:hover:bg-zinc-100 transition-all shadow-[4px_4px_0px_0px_rgba(16,185,129,0.5)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
          >
            Pre-Register Visitor
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center text-base font-bold h-12 px-8 border-2 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white bg-transparent text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all active:translate-y-0.5"
          >
            Launch System Dashboard
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="neo-card p-4 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Registered Today</span>
            <span className="text-2xl font-black mt-1 text-black dark:text-white">
              {isLoaded ? totalToday : '...'}
            </span>
          </div>
          <div className="neo-card p-4 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Checked In Today</span>
            <span className="text-2xl font-black mt-1 text-emerald-500">
              {isLoaded ? checkedInToday : '...'}
            </span>
          </div>
          <div className="neo-card p-4 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Currently Inside</span>
            <span className="text-2xl font-black mt-1 text-emerald-500 animate-pulse">
              {isLoaded ? currentlyInside : '...'}
            </span>
          </div>
          <div className="neo-card p-4 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Avg Check-In Time</span>
            <span className="text-2xl font-black mt-1 text-black dark:text-white">1.8m</span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-black tracking-tight text-black dark:text-white mb-4">
            Designed for Live Campus Security
          </h2>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            A comprehensive, digital-first alternative to paper sheets that integrates registration, validation, and analytics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx} 
                className="neo-card p-6 bg-white dark:bg-zinc-950 flex flex-col items-start border-2 border-zinc-200 dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
              >
                <div className="h-10 w-10 border-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-emerald-500 mb-4 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-black dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Campus Operations Section */}
      <section className="bg-zinc-50 dark:bg-zinc-950 border-t-2 border-zinc-100 dark:border-zinc-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tight text-black dark:text-white leading-tight">
              A Complete Open-Day Demo <br />Ready for Interactive Use
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              We've pre-seeded the system with a fully loaded simulation containing 30 visitor records. You can instantly test checking people in, search profiles, view and print passes, and watch the admin statistics react in real-time.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Pre-seeded database of 30+ visitors (today, yesterday, and future).
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Simulate QR scans and register passes instantly.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Generate mock spikes and rush-hour arrivals.
                </span>
              </div>
            </div>
          </div>
          <div className="neo-card p-6 bg-white dark:bg-black border-2 border-black dark:border-zinc-800 shadow-[6px_6px_0px_0px_rgba(16,185,129,0.2)]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500 animate-spin" /> Simulated Dashboard Preview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs p-3 border-2 border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
                <span className="font-bold text-black dark:text-white">Admin Analytics Console</span>
                <Link href="/dashboard" className="text-emerald-500 hover:underline flex items-center gap-1 font-bold">
                  View Live <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="flex justify-between items-center text-xs p-3 border-2 border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
                <span className="font-bold text-black dark:text-white">Reception Desk Portal</span>
                <Link href="/desk" className="text-emerald-500 hover:underline flex items-center gap-1 font-bold">
                  Open Desk <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
