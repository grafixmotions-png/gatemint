'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserPlus, KeyRound, Settings, RefreshCw } from 'lucide-react';
import { useVisitors } from '@/context/VisitorContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { resetToSeed } = useVisitors();

  const links = [
    { href: '/dashboard', label: 'Analytics', icon: LayoutDashboard },
    { href: '/visitors', label: 'Visitor Records', icon: Users },
    { href: '/desk', label: 'Front Desk Panel', icon: KeyRound },
    { href: '/register', label: 'New Registration', icon: UserPlus },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 border-r-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 hidden md:flex no-print">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3">
            System Console
          </p>
          <nav className="space-y-1 pt-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium border-2 transition-all ${
                    isActive(link.href)
                      ? 'bg-zinc-100 dark:bg-zinc-900 border-black dark:border-white text-black dark:text-white shadow-[2px_2px_0px_0px_rgba(16,185,129,0.5)] font-bold'
                      : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-950'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive(link.href) ? 'text-emerald-500' : ''}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 pb-2">
            Campus Info
          </p>
          <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400 px-3">
            <div className="flex justify-between">
              <span>Institution:</span>
              <span className="font-semibold text-black dark:text-white">GateMint College</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all visitor data to defaults?')) {
              resetToSeed();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:text-white border-2 border-red-500 hover:bg-red-500 transition-colors active:translate-y-0.5"
        >
          <RefreshCw className="h-3 w-3" />
          Reset Seed Data
        </button>
        <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500">
          GateMint v1.0.0
        </p>
      </div>
    </aside>
  );
}
