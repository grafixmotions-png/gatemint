'use client';

import React, { use } from 'react';
import { useVisitors } from '@/context/VisitorContext';
import Sidebar from '@/components/Sidebar';
import { 
  User, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Building2, 
  FileText, 
  ShieldCheck, 
  LogOut,
  QrCode,
  Activity,
  CheckCircle,
  HelpCircle,
  FileClock
} from 'lucide-react';
import Link from 'next/link';

interface VisitorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function VisitorDetail({ params }: VisitorDetailPageProps) {
  const { id } = use(params);
  const { visitors, checkInVisitor, checkOutVisitor, isLoaded } = useVisitors();

  const visitor = visitors.find(v => v.id === id || v.visitorId === id);

  if (!isLoaded) {
    return (
      <div className="flex-1 flex bg-zinc-50 dark:bg-black/95">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <div className="h-8 w-8 border-2 border-zinc-200 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-xs">Accessing files...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="flex-1 flex bg-zinc-50 dark:bg-black/95">
        <Sidebar />
        <main className="flex-1 p-8 max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-500">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-black dark:text-white">Record Not Found</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              The visitor file reference <span className="font-mono font-bold text-red-500">"{id}"</span> does not exist in our registry database.
            </p>
          </div>
          <Link
            href="/visitors"
            className="inline-flex items-center justify-center text-xs font-bold h-10 px-4 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-900 transition-all"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Records
          </Link>
        </main>
      </div>
    );
  }

  const getStatusColor = (status: typeof visitor.status) => {
    switch (status) {
      case 'Approved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200';
      case 'Checked In':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
      case 'Checked Out':
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200';
    }
  };

  // Timeline helper dates
  const registeredTime = new Date(visitor.createdAt).toLocaleString();
  const checkInTime = visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString() : null;
  const checkOutTime = visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString() : null;

  return (
    <div className="flex-1 flex bg-zinc-50 dark:bg-black/95">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Breadcrumb / Back Navigation */}
        <div className="no-print">
          <Link
            href="/visitors"
            className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Visitor Database
          </Link>
        </div>

        {/* Profile Details Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b-2 border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 border-2 border-black dark:border-white bg-black dark:bg-zinc-900 flex items-center justify-center text-emerald-500 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">
                  {visitor.fullName}
                </h1>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded-full ${getStatusColor(visitor.status)}`}>
                  {visitor.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Pass ID: {visitor.visitorId} • Segment: {visitor.visitorType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <Link
              href={`/pass/${visitor.visitorId}`}
              className="inline-flex items-center justify-center text-xs font-bold h-9 px-4 border-2 border-black dark:border-white bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            >
              <QrCode className="mr-1.5 h-4 w-4 text-emerald-500" /> View Digital pass
            </Link>
          </div>
        </div>

        {/* Core Layout: Profile Info vs Timeline Card */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Profile metadata panel */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Card 1: Details */}
            <div className="neo-card bg-white dark:bg-zinc-950 p-6 border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-150 dark:border-zinc-900 pb-2 mb-4">
                Visitor File Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <Phone className="h-3 w-3 text-emerald-500" /> Phone Contact
                  </span>
                  <span className="font-bold text-black dark:text-white">{visitor.phone}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <Mail className="h-3 w-3 text-emerald-500" /> Email Address
                  </span>
                  <span className="font-bold text-black dark:text-white">{visitor.email}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-emerald-500" /> Host Department
                  </span>
                  <span className="font-bold text-black dark:text-white">{visitor.hostDepartment}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <FileText className="h-3 w-3 text-emerald-500" /> Purpose of Visit
                  </span>
                  <span className="font-bold text-black dark:text-white">{visitor.purpose}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-emerald-500" /> Date of Visit
                  </span>
                  <span className="font-bold text-black dark:text-white">{visitor.visitDate}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3 text-emerald-500" /> Expected Arrival
                  </span>
                  <span className="font-bold text-black dark:text-white">{visitor.expectedTime}</span>
                </div>
              </div>
            </div>

            {/* Notes Panel */}
            <div className="neo-card bg-white dark:bg-zinc-950 p-6 border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-150 dark:border-zinc-900 pb-2 mb-3">
                Security & Administrative Notes
              </h3>
              {visitor.notes ? (
                <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                  "{visitor.notes}"
                </p>
              ) : (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
                  No additional logs, notes, or parking coordinates filed for this visitor.
                </p>
              )}
            </div>

            {/* Quick action controls inside detail */}
            <div className="neo-card bg-white dark:bg-zinc-950 p-6 border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] no-print">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-150 dark:border-zinc-900 pb-2 mb-4">
                Gate Management Actions
              </h3>
              
              <div className="flex gap-3">
                <button
                  onClick={() => checkInVisitor(visitor.id)}
                  disabled={visitor.status === 'Checked In' || visitor.status === 'Checked Out'}
                  className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold h-10 border-2 border-emerald-500 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 disabled:shadow-none text-black font-semibold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" /> Check In Visitor
                </button>
                <button
                  onClick={() => checkOutVisitor(visitor.id)}
                  disabled={visitor.status !== 'Checked In'}
                  className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold h-10 border-2 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white disabled:opacity-40 disabled:hover:bg-zinc-200 disabled:shadow-none bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-red-500" /> Log Check Out
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Status Timeline Tracking */}
          <div className="lg:col-span-5">
            <div className="neo-card bg-white dark:bg-zinc-950 p-6 border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] h-full">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-150 dark:border-zinc-900 pb-2 mb-6">
                Gate Entry Status Timeline
              </h3>

              <div className="space-y-8 pl-4 relative">
                {/* Timeline connector track */}
                <div className="absolute top-2 bottom-2 left-6 w-[2px] bg-zinc-200 dark:bg-zinc-800 pointer-events-none"></div>

                {/* Step 1: Pre-Registration */}
                <div className="flex gap-4 relative text-xs items-start">
                  <div className="h-5 w-5 rounded-full bg-emerald-500 text-black dark:text-white flex items-center justify-center font-bold text-[10px] z-10 shadow-sm border border-white dark:border-black">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-black dark:text-white text-sm">Pass Pre-Registered</h4>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1 font-mono">
                      <FileClock className="h-3 w-3" /> {registeredTime}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-[280px]">
                      Visitor pass records initialized in system registry database.
                    </p>
                  </div>
                </div>

                {/* Step 2: Checked In */}
                <div className="flex gap-4 relative text-xs items-start">
                  {checkInTime ? (
                    <div className="h-5 w-5 rounded-full bg-emerald-500 text-black dark:text-white flex items-center justify-center font-bold text-[10px] z-10 border border-white dark:border-black">
                      ✓
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center font-bold text-[10px] z-10 border-2 border-zinc-300 dark:border-zinc-800">
                      2
                    </div>
                  )}
                  <div>
                    <h4 className={`font-bold text-sm ${checkInTime ? 'text-black dark:text-white' : 'text-zinc-450 dark:text-zinc-500'}`}>
                      Gate Check-In Approved
                    </h4>
                    {checkInTime && (
                      <p className="text-[10px] text-emerald-500 mt-0.5 flex items-center gap-1 font-mono">
                        <Activity className="h-3 w-3" /> {checkInTime}
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-[280px]">
                      {checkInTime 
                        ? `Validated by front desk. Admitted into campus sector: ${visitor.hostDepartment}.` 
                        : 'Awaiting visitor arrival at the gates.'
                      }
                    </p>
                  </div>
                </div>

                {/* Step 3: Checked Out */}
                <div className="flex gap-4 relative text-xs items-start">
                  {checkOutTime ? (
                    <div className="h-5 w-5 rounded-full bg-emerald-500 text-black dark:text-white flex items-center justify-center font-bold text-[10px] z-10 border border-white dark:border-black">
                      ✓
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center font-bold text-[10px] z-10 border-2 border-zinc-300 dark:border-zinc-800">
                      3
                    </div>
                  )}
                  <div>
                    <h4 className={`font-bold text-sm ${checkOutTime ? 'text-black dark:text-white' : 'text-zinc-450 dark:text-zinc-500'}`}>
                      Logged Check-Out Exit
                    </h4>
                    {checkOutTime && (
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-550 mt-0.5 flex items-center gap-1 font-mono">
                        <LogOut className="h-3 w-3 text-red-500" /> {checkOutTime}
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-[280px]">
                      {checkOutTime 
                        ? 'Exit timestamp logged by security detail. Campus pass deactivated.'
                        : 'Still on-campus (active pass).'
                      }
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
