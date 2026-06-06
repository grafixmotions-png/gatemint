'use client';

import React, { useState, useEffect } from 'react';
import { useVisitors } from '@/context/VisitorContext';
import Sidebar from '@/components/Sidebar';
import { Visitor } from '@/utils/seedData';
import { 
  KeyRound, 
  Search, 
  Scan, 
  CheckCircle, 
  LogOut, 
  User, 
  Phone, 
  Landmark, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Camera
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const CameraScanner = dynamic(() => import('@/components/CameraScanner'), {
  ssr: false,
});

export default function FrontDesk() {
  const { visitors, registerVisitor, checkInVisitor, checkOutVisitor, isLoaded } = useVisitors();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [scannedId, setScannedId] = useState('');
  const [activeVisitor, setActiveVisitor] = useState<Visitor | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Camera active state
  const [cameraActive, setCameraActive] = useState(false);

  // Auto-clear notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Synchronize active visitor state when visitors list updates
  useEffect(() => {
    if (activeVisitor) {
      const updated = visitors.find(v => v.id === activeVisitor.id);
      if (updated) setActiveVisitor(updated);
    }
  }, [visitors, activeVisitor]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
  };

  // Perform search filter
  const filteredVisitors = searchQuery.trim() === '' 
    ? [] 
    : visitors.filter(v => 
        v.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.visitorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.phone.includes(searchQuery)
      ).slice(0, 5);

  const handleSimulateScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedId.trim()) return;

    let visitorIdToFind = scannedId.trim();

    // Support simulating full URLs too
    if (visitorIdToFind.startsWith('http://') || visitorIdToFind.startsWith('https://')) {
      try {
        const url = new URL(visitorIdToFind);
        const pathParts = url.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart) visitorIdToFind = lastPart;
      } catch (err) {}
    }

    const matched = visitors.find(
      v => v.visitorId.toLowerCase() === visitorIdToFind.toLowerCase() || v.id === visitorIdToFind
    );

    if (matched) {
      setActiveVisitor(matched);
      showToast(`Scan successful: Loaded pass for ${matched.fullName}`, 'success');
    } else {
      showToast(`Scan failed: No record found for ID "${scannedId}"`, 'error');
    }
    setScannedId('');
  };

  const selectVisitor = (visitor: Visitor) => {
    setActiveVisitor(visitor);
    setSearchQuery('');
  };

  const handleCheckIn = (id: string, name: string) => {
    checkInVisitor(id);
    showToast(`${name} has been Checked In successfully!`, 'success');
  };

  const handleCheckOut = (id: string, name: string) => {
    checkOutVisitor(id);
    showToast(`${name} has been Checked Out successfully!`, 'info');
  };

  // List of recent arrivals today (Checked in today)
  const todayStr = new Date().toISOString().split('T')[0];
  const recentArrivals = visitors
    .filter(v => v.visitDate === todayStr && v.checkInTime)
    .sort((a, b) => new Date(b.checkInTime || '').getTime() - new Date(a.checkInTime || '').getTime());

  return (
    <div className="flex-1 flex bg-zinc-50 dark:bg-black/95 py-0 px-0">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-2 border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-black text-black dark:text-white flex items-center gap-2">
              <KeyRound className="h-6 w-6 text-emerald-500" />
              Front Desk Operations
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Verify campus digital passes, check-in arrivals, and log exit timestamps.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Scanner Online</span>
          </div>
        </div>

        {/* Live Notification Banner */}
        {notification && (
          <div className={`p-4 border-2 transition-all flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] ${
            notification.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-800 dark:text-emerald-300' 
              : notification.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-800 dark:text-red-300'
              : 'bg-zinc-100 dark:bg-zinc-900 border-black dark:border-white text-zinc-800 dark:text-zinc-200'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold">
              {notification.type === 'error' ? <AlertCircle className="h-4.5 w-4.5" /> : <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />}
              {notification.text}
            </div>
            <button onClick={() => setNotification(null)} className="text-xs font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Main Grid: Scan Panel vs Active Profile Card */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Search & Simulation */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Search Visitor Bar */}
            <div className="neo-card p-6 bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5" /> Search Registry
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Name, Phone, or Pass ID (e.g. GM-2026-...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm border-2 border-zinc-200 dark:border-zinc-800 rounded px-3 py-2.5 pl-10 bg-transparent focus:border-emerald-500 outline-none text-black dark:text-white"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
              </div>

              {/* Live search results */}
              {searchQuery.trim() !== '' && (
                <div className="mt-3 border-2 border-zinc-100 dark:border-zinc-900 rounded overflow-hidden divide-y-2 divide-zinc-100 dark:divide-zinc-900 bg-zinc-50 dark:bg-black/40">
                  {filteredVisitors.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-400">
                      No matching registered visitors found.
                    </div>
                  ) : (
                    filteredVisitors.map(v => (
                      <button
                        key={v.id}
                        onClick={() => selectVisitor(v)}
                        className="w-full p-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-900 flex justify-between items-center text-xs transition-colors"
                      >
                        <div>
                          <p className="font-bold text-black dark:text-white">{v.fullName}</p>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{v.visitorId} • {v.phone}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[9px]">
                          {v.visitorType}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Simulate Scan Input */}
            <div className="neo-card p-6 bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
                <Scan className="h-3.5 w-3.5" /> Gate QR Scanner
              </h3>
              <CameraScanner 
                active={cameraActive}
                onScanSuccess={(decodedText) => {
                  let visitorIdToFind = decodedText.trim();
                  let scannedVisitorData: any = null;
                  
                  // If the decoded text is a URL, extract the ID from the end of the pathname
                  if (visitorIdToFind.startsWith('http://') || visitorIdToFind.startsWith('https://')) {
                    try {
                      const url = new URL(visitorIdToFind);
                      const pathParts = url.pathname.split('/');
                      const lastPart = pathParts[pathParts.length - 1];
                      if (lastPart) {
                        visitorIdToFind = lastPart;
                      }
                    } catch (e) {
                      // Fallback: keep visitorIdToFind as the full string
                    }
                  }
                  
                  // Try parsing the decoded QR text as a JSON string (transferred visitor info)
                  try {
                    const parsed = JSON.parse(decodedText.trim());
                    if (parsed && parsed.id && parsed.fullName) {
                      visitorIdToFind = parsed.id;
                      scannedVisitorData = parsed;
                    }
                  } catch (err) {
                    // Fail silently, treat as normal visitor ID string (backward compatibility)
                  }

                  // Find match in local visitors list
                  let matched = visitors.find(
                    v => v.visitorId.toLowerCase() === visitorIdToFind.toLowerCase() || v.id === visitorIdToFind
                  );

                  // If not found in laptop registry, register them dynamically from QR payload!
                  if (!matched && scannedVisitorData) {
                    try {
                      const newPass = registerVisitor({
                        fullName: scannedVisitorData.fullName,
                        phone: scannedVisitorData.phone,
                        email: scannedVisitorData.email,
                        visitorType: scannedVisitorData.visitorType,
                        purpose: scannedVisitorData.purpose,
                        hostDepartment: scannedVisitorData.hostDepartment,
                        visitDate: scannedVisitorData.visitDate,
                        expectedTime: scannedVisitorData.expectedTime,
                        notes: scannedVisitorData.notes,
                        customId: scannedVisitorData.id
                      });
                      matched = newPass;
                      showToast(`Synced: Registered ${newPass.fullName} from QR`, 'success');
                    } catch (e) {
                      showToast(`Error syncing QR visitor data`, 'error');
                    }
                  }

                  if (matched) {
                    setActiveVisitor(matched);
                    showToast(`Scan successful: Loaded pass for ${matched.fullName}`, 'success');
                    setCameraActive(false);
                  } else {
                    showToast(`Scan failed: No record found for ID "${visitorIdToFind}"`, 'error');
                  }
                }}
              />

              {cameraActive && (
                <div className="mb-4 text-right no-print">
                  <button 
                    type="button"
                    onClick={() => setCameraActive(false)}
                    className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white font-bold text-[9px] uppercase rounded transition-colors"
                  >
                    Close Camera View
                  </button>
                </div>
              )}
              
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                <form onSubmit={handleSimulateScanSubmit} className="flex col-span-2 gap-2">
                  <input
                    type="text"
                    placeholder="Paste/Type Visitor ID (e.g. GM-2026-0810)"
                    value={scannedId}
                    onChange={(e) => setScannedId(e.target.value)}
                    className="flex-1 text-xs border-2 border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 bg-transparent focus:border-emerald-500 outline-none text-black dark:text-white"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center text-xs font-bold px-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-all cursor-pointer"
                  >
                    Simulate
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setCameraActive(!cameraActive)}
                  className="col-span-2 inline-flex items-center justify-center gap-1.5 text-xs font-bold h-10 border-2 border-emerald-500 bg-transparent text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer active:translate-y-0.5"
                >
                  <Camera className="h-4 w-4" /> {cameraActive ? 'Deactivate Camera' : 'Activate Camera Scanner'}
                </button>
              </div>

              {/* Fast scan shortcuts for demo convenience */}
              <div>
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                  Presentation Fast Shortcuts:
                </p>
                <div className="flex flex-wrap gap-2">
                  {visitors.slice(0, 4).map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setActiveVisitor(v);
                        showToast(`Shortcut Loaded: ${v.fullName} (${v.visitorId})`, 'info');
                      }}
                      className="px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 rounded text-[10px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
                    >
                      Scan {v.fullName.split(' ')[0]} ({v.status})
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Profile & Gate Action Center */}
          <div className="lg:col-span-5">
            {activeVisitor ? (
              <div className="neo-card bg-white dark:bg-zinc-950 p-6 border-2 border-emerald-500 shadow-[6px_6px_0px_0px_rgba(16,185,129,0.15)] flex flex-col justify-between h-full">
                
                {/* Header detail */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider text-[9px] mb-2 inline-block">
                        {activeVisitor.visitorType}
                      </span>
                      <h2 className="text-xl font-black text-black dark:text-white leading-none">
                        {activeVisitor.fullName}
                      </h2>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block mt-1">
                        ID: {activeVisitor.visitorId}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded-full ${
                      activeVisitor.status === 'Checked In' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                        : activeVisitor.status === 'Checked Out'
                        ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200'
                    }`}>
                      {activeVisitor.status}
                    </span>
                  </div>

                  {/* Core details */}
                  <div className="grid grid-cols-2 gap-4 text-xs border-y-2 border-zinc-100 dark:border-zinc-900 py-4">
                    <div className="space-y-1">
                      <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                        <Landmark className="h-3 w-3" /> Host Department
                      </span>
                      <span className="font-bold text-black dark:text-white">{activeVisitor.hostDepartment}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Expected Time
                      </span>
                      <span className="font-bold text-black dark:text-white">{activeVisitor.expectedTime}</span>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                        <User className="h-3 w-3" /> Purpose of Visit
                      </span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">{activeVisitor.purpose}</span>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Contact Info
                      </span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">{activeVisitor.phone} | {activeVisitor.email}</span>
                    </div>
                  </div>

                  {/* Active Time Logs */}
                  {(activeVisitor.checkInTime || activeVisitor.checkOutTime) && (
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 border-2 border-zinc-100 dark:border-zinc-800 text-[10px] grid grid-cols-2 gap-2 text-zinc-500 dark:text-zinc-400 font-mono">
                      <div>
                        <span className="block font-bold text-[8px] uppercase tracking-wider text-zinc-400">Entry Time</span>
                        <span className="text-black dark:text-white">
                          {activeVisitor.checkInTime ? new Date(activeVisitor.checkInTime).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block font-bold text-[8px] uppercase tracking-wider text-zinc-400">Exit Time</span>
                        <span className="text-black dark:text-white">
                          {activeVisitor.checkOutTime ? new Date(activeVisitor.checkOutTime).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Action triggers */}
                <div className="mt-8 space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCheckIn(activeVisitor.id, activeVisitor.fullName)}
                      disabled={activeVisitor.status === 'Checked In' || activeVisitor.status === 'Checked Out'}
                      className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold h-11 border-2 border-emerald-500 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 disabled:shadow-none text-black font-semibold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
                    >
                      <CheckCircle className="h-4 w-4" /> Check In Entry
                    </button>
                    <button
                      onClick={() => handleCheckOut(activeVisitor.id, activeVisitor.fullName)}
                      disabled={activeVisitor.status !== 'Checked In'}
                      className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold h-11 border-2 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white disabled:opacity-40 disabled:hover:bg-zinc-200 disabled:shadow-none bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-red-500" /> Log Check Out
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500">
                    <Link href={`/pass/${activeVisitor.visitorId}`} className="hover:underline hover:text-black dark:hover:text-white">
                      Open Full Digital Pass &rarr;
                    </Link>
                    <button onClick={() => setActiveVisitor(null)} className="hover:underline text-red-500">
                      Clear Selection
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="neo-card bg-white dark:bg-zinc-950 p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 h-full flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-500 py-16">
                <HelpCircle className="h-10 w-10 mb-3 opacity-40 text-emerald-500" />
                <h3 className="font-bold text-sm text-black dark:text-white mb-1">No Active Scan Profile</h3>
                <p className="text-[11px] max-w-[240px] leading-relaxed">
                  Search the registry or enter a pass ID to validate entry permissions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Arrivals Today List */}
        <div className="neo-card p-6 bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-500" /> Recent Arrivals Today
          </h3>

          {recentArrivals.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              No entries logged today yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-100 dark:border-zinc-900 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                    <th className="py-2 px-3">Visitor Name</th>
                    <th className="py-2 px-3">Pass ID</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Department</th>
                    <th className="py-2 px-3">Check-In Time</th>
                    <th className="py-2 px-3">Check-Out Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {recentArrivals.slice(0, 6).map(v => (
                    <tr key={v.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                      <td className="py-3 px-3 font-bold text-black dark:text-white">{v.fullName}</td>
                      <td className="py-3 px-3 font-mono">{v.visitorId}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 font-bold rounded text-[9px] uppercase">
                          {v.visitorType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">{v.hostDepartment}</td>
                      <td className="py-3 px-3 font-mono">
                        {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                      </td>
                      <td className="py-3 px-3">
                        {v.status === 'Checked Out' ? (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                            Out at {new Date(v.checkOutTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCheckOut(v.id, v.fullName)}
                            className="px-2 py-1 text-[10px] font-bold text-red-500 hover:text-white border border-red-200 hover:bg-red-500 hover:border-red-500 rounded transition-colors active:translate-y-0.5"
                          >
                            Checkout Exit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
