'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import { Shield, Printer, Download, ArrowLeft, CheckCircle, Calendar, Clock, User, Landmark } from 'lucide-react';
import { Visitor } from '@/utils/seedData';
import confetti from 'canvas-confetti';

interface VisitorPassProps {
  visitor: Visitor;
  triggerConfetti?: boolean;
  onBackClick?: () => void;
}

export default function VisitorPass({ visitor, triggerConfetti = false, onBackClick }: VisitorPassProps) {
  const passRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = React.useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const qrCodeValue = origin ? `${origin}/pass/${visitor.visitorId}` : visitor.visitorId;

  useEffect(() => {
    if (triggerConfetti) {
      // Fire confetti
      const duration = 2 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#ffffff', '#000000']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10b981', '#ffffff', '#000000']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [triggerConfetti]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const fileContent = `
=========================================
          GATEMINT CAMPUS PASS          
=========================================
Pass ID:      ${visitor.visitorId}
Name:         ${visitor.fullName}
Type:         ${visitor.visitorType}
Host Dept:    ${visitor.hostDepartment}
Purpose:      ${visitor.purpose}
Visit Date:   ${visitor.visitDate}
Expected Time: ${visitor.expectedTime}
Status:       ${visitor.status}
Created At:   ${new Date(visitor.createdAt).toLocaleString()}
=========================================
Please present the QR code at the Gate.
    `;
    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `GateMint_Pass_${visitor.visitorId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getStatusColor = (status: Visitor['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'Checked In':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
      case 'Checked Out':
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
      default:
        return 'bg-zinc-100 text-zinc-800';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto w-full">
      {/* Printable Area Wrapper */}
      <div 
        ref={passRef}
        className="print-area w-full neo-card bg-white dark:bg-zinc-950 overflow-hidden relative border-2 border-black dark:border-zinc-800 shadow-[6px_6px_0px_0px_rgba(16,185,129,0.2)]"
      >
        {/* Border accent */}
        <div className="h-2 w-full bg-emerald-500"></div>

        {/* Top Header */}
        <div className="p-6 border-b-2 border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 flex items-center justify-center border border-black dark:border-white bg-black dark:bg-zinc-900">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-black dark:text-white">
              Gate<span className="text-emerald-500">Mint</span>
            </span>
          </div>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">
            Campus Pass
          </span>
        </div>

        {/* Pass Contents */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-xl font-black text-black dark:text-white tracking-tight leading-none mb-1">
                {visitor.fullName}
              </h2>
              <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 block mb-3">
                ID: {visitor.visitorId}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(visitor.status)}`}>
                {visitor.status}
              </span>
            </div>
            
            {/* Type Badge */}
            <div className="text-right">
              <span className="px-2 py-1 bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider text-[9px]">
                {visitor.visitorType}
              </span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/30 dark:bg-zinc-900/10">
            <QRCodeCanvas 
              value={qrCodeValue} 
              size={256}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              className="bg-white p-2 border border-zinc-200 dark:border-zinc-800 w-40 h-40"
              level={"H"}
              includeMargin={false}
            />
            <p className="mt-3 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Present for Gate Verification
            </p>
          </div>

          {/* Details list */}
          <div className="grid grid-cols-2 gap-4 text-xs border-t-2 border-zinc-100 dark:border-zinc-900 pt-6">
            <div className="space-y-1">
              <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                <Landmark className="h-3 w-3" /> Host Department
              </span>
              <span className="font-bold text-black dark:text-white">
                {visitor.hostDepartment}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date of Visit
              </span>
              <span className="font-bold text-black dark:text-white">
                {visitor.visitDate}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3" /> Expected Time
              </span>
              <span className="font-bold text-black dark:text-white">
                {visitor.expectedTime}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                <User className="h-3 w-3" /> Purpose
              </span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate block">
                {visitor.purpose}
              </span>
            </div>
          </div>

          {visitor.checkInTime && (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 border-2 border-zinc-100 dark:border-zinc-800 text-[11px] grid grid-cols-2 gap-2 text-zinc-500 dark:text-zinc-400 font-mono">
              <div>
                <span className="block font-bold text-[9px] uppercase tracking-wider text-zinc-400 font-sans">Checked In</span>
                <span className="text-black dark:text-white font-mono">
                  {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {visitor.checkOutTime && (
                <div>
                  <span className="block font-bold text-[9px] uppercase tracking-wider text-zinc-400 font-sans">Checked Out</span>
                  <span className="text-black dark:text-white font-mono">
                    {new Date(visitor.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          )}

          {visitor.notes && (
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3 text-[11px] text-zinc-500 dark:text-zinc-400 italic">
              <span className="font-bold not-italic block text-[9px] uppercase tracking-wider text-zinc-400 mb-0.5">Notes:</span>
              "{visitor.notes}"
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-zinc-50 dark:bg-zinc-900 px-6 py-4 border-t-2 border-zinc-100 dark:border-zinc-900 text-center text-[10px] text-zinc-400 dark:text-zinc-500 font-medium font-sans">
          GateMint Visitor Security System • Managed Institution Pass
        </div>
      </div>

      {/* Button Controls - Hidden on Print */}
      <div className="w-full flex gap-3 no-print">
        <button
          onClick={handlePrint}
          className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm font-semibold active:translate-y-0.5"
        >
          <Printer className="h-4 w-4" /> Print Pass
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 border-2 border-emerald-500 bg-emerald-500 text-black hover:bg-emerald-600 text-sm font-semibold active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
        >
          <Download className="h-4 w-4" /> Download Info
        </button>
      </div>

      {onBackClick ? (
        <button
          onClick={onBackClick}
          className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 no-print"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Dashboard
        </button>
      ) : (
        <Link
          href="/dashboard"
          className="text-xs text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 no-print"
        >
          <ArrowLeft className="h-3 w-3" /> Go to Dashboard
        </Link>
      )}
    </div>
  );
}
