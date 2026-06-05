'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, ArrowRight, Activity } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/register', label: 'Register' },
    { href: '/desk', label: 'Front Desk' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/visitors', label: 'Records' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 flex items-center justify-center border-2 border-black dark:border-white bg-black dark:bg-zinc-900 group-hover:bg-emerald-500 transition-colors shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
                <Shield className="h-5 w-5 text-white group-hover:text-black transition-colors" />
              </div>
              <span className="text-xl font-bold tracking-tight flex items-center">
                Gate<span className="text-emerald-500 dark:text-emerald-400">Mint</span>
                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-emerald-500 py-1 border-b-2 ${
                  isActive(link.href)
                    ? 'border-emerald-500 text-black dark:text-white font-bold'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 border-2 border-black dark:border-white bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all active:translate-y-0.5"
            >
              Register Pass
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center text-sm font-medium h-9 px-4 border-2 border-emerald-500 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-base font-medium rounded-md ${
                isActive(link.href)
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-emerald-500 dark:text-emerald-400 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center inline-flex items-center justify-center text-sm font-medium h-10 border-2 border-black dark:border-white bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            >
              Register Pass
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center inline-flex items-center justify-center text-sm font-medium h-10 border-2 border-emerald-500 bg-emerald-500 text-black font-semibold hover:bg-emerald-600 transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
