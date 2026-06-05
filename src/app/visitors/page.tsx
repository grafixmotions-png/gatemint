'use client';

import React, { useState } from 'react';
import { useVisitors } from '@/context/VisitorContext';
import Sidebar from '@/components/Sidebar';
import { Visitor } from '@/utils/seedData';
import { 
  Users, 
  Search, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  LogOut, 
  Calendar,
  X,
  Filter,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

export default function VisitorRecords() {
  const { visitors, checkInVisitor, checkOutVisitor, isLoaded } = useVisitors();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Checked In' | 'Checked Out'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Parent' | 'Student' | 'Guest' | 'Vendor' | 'Staff Family' | 'Speaker'>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Yesterday'>('All');

  // Filter handlers
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTypeFilter('All');
    setDateFilter('All');
  };

  // Perform multi-dimensional filter
  const getFilteredVisitors = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    // Yesterday calculator
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    return visitors.filter(v => {
      // 1. Search Query
      const matchesSearch = searchQuery.trim() === '' || 
        v.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.visitorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.phone.includes(searchQuery) ||
        v.hostDepartment.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Status Filter
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;

      // 3. Type Filter
      const matchesType = typeFilter === 'All' || v.visitorType === typeFilter;

      // 4. Date Filter
      let matchesDate = true;
      if (dateFilter === 'Today') {
        matchesDate = v.visitDate === todayStr;
      } else if (dateFilter === 'Yesterday') {
        matchesDate = v.visitDate === yesterdayStr;
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  };

  const filtered = getFilteredVisitors();

  // Client Side CSV Exporter
  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = [
      'Visitor ID', 'Full Name', 'Email', 'Phone', 'Visitor Type', 
      'Purpose', 'Host Department', 'Visit Date', 'Expected Time', 
      'Status', 'Check-In Time', 'Check-Out Time', 'Notes', 'Created At'
    ];

    const rows = filtered.map(v => [
      v.visitorId,
      `"${v.fullName.replace(/"/g, '""')}"`,
      v.email,
      v.phone,
      v.visitorType,
      `"${v.purpose.replace(/"/g, '""')}"`,
      `"${v.hostDepartment.replace(/"/g, '""')}"`,
      v.visitDate,
      v.expectedTime,
      v.status,
      v.checkInTime || '',
      v.checkOutTime || '',
      `"${(v.notes || '').replace(/"/g, '""')}"`,
      v.createdAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GateMint_Visitors_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status badging coloring
  const getStatusBadgeClass = (status: Visitor['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200';
      case 'Checked In':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
      case 'Checked Out':
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200';
    }
  };

  return (
    <div className="flex-1 flex bg-zinc-50 dark:bg-black/95">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-2 border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-black text-black dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-emerald-500" />
              Visitor Registry Database
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Search, filter, manage status, and export the campus visitor archives.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="inline-flex items-center justify-center text-xs font-bold h-9 px-4 border-2 border-emerald-500 bg-emerald-500 text-black hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV List
            </button>
          </div>
        </div>

        {/* Filter Toolbar console */}
        <div className="neo-card p-6 bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by name, ID, phone, or host department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border-2 border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 pl-9 bg-transparent focus:border-emerald-500 outline-none text-black dark:text-white"
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400" />
            </div>

            {/* Date Select */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Date:</span>
              <select
                value={dateFilter}
                onChange={(e: any) => setDateFilter(e.target.value)}
                className="text-xs border-2 border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 bg-transparent dark:bg-zinc-950 text-black dark:text-white outline-none"
              >
                <option value="All">All Dates</option>
                <option value="Today">Today (June 4)</option>
                <option value="Yesterday">Yesterday (June 3)</option>
              </select>
            </div>

            {/* Type Select */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Segment:</span>
              <select
                value={typeFilter}
                onChange={(e: any) => setTypeFilter(e.target.value)}
                className="text-xs border-2 border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 bg-transparent dark:bg-zinc-950 text-black dark:text-white outline-none"
              >
                <option value="All">All Segments</option>
                <option value="Parent">Parent</option>
                <option value="Student">Student</option>
                <option value="Guest">Guest</option>
                <option value="Vendor">Vendor</option>
                <option value="Staff Family">Staff Family</option>
                <option value="Speaker">Speaker</option>
              </select>
            </div>
          </div>

          {/* Filtering Chips - Status Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-2 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Status:
              </span>
              {(['All', 'Approved', 'Checked In', 'Checked Out'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-[11px] font-bold border rounded-full transition-all ${
                    statusFilter === status
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {(searchQuery || statusFilter !== 'All' || typeFilter !== 'All' || dateFilter !== 'All') && (
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear Active Filters
              </button>
            )}
          </div>
        </div>

        {/* Database Table Card */}
        <div className="neo-card bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden">
          {!isLoaded ? (
            <div className="p-16 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <div className="h-8 w-8 border-2 border-zinc-200 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-xs">Accessing files...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-zinc-450 dark:text-zinc-500 space-y-2">
              <UserCheck className="h-8 w-8 mx-auto opacity-40 text-emerald-500" />
              <h3 className="font-bold text-sm text-black dark:text-white">No Matching Records</h3>
              <p className="text-xs max-w-xs mx-auto leading-relaxed">
                Adjust your filters or register a new visitor pass to populate the archives.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Visitor</th>
                    <th className="py-3 px-4">Pass ID</th>
                    <th className="py-3 px-4">Segment</th>
                    <th className="py-3 px-4">Visit Date</th>
                    <th className="py-3 px-4">Host Sector</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-zinc-100 dark:divide-zinc-900">
                  {filtered.map(v => (
                    <tr key={v.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                      
                      {/* Name & Contact detail */}
                      <td className="py-3.5 px-4">
                        <div>
                          <Link href={`/visitors/${v.id}`} className="font-bold text-black dark:text-white hover:text-emerald-500 hover:underline">
                            {v.fullName}
                          </Link>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{v.phone} • {v.email}</p>
                        </div>
                      </td>

                      {/* Pass ID */}
                      <td className="py-3.5 px-4 font-mono font-medium">{v.visitorId}</td>

                      {/* Type segment */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 font-bold text-[9px] uppercase">
                          {v.visitorType}
                        </span>
                      </td>

                      {/* Date / expected time */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-black dark:text-white">{v.visitDate}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">Time: {v.expectedTime}</div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300 font-semibold">{v.hostDepartment}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold border rounded-full ${getStatusBadgeClass(v.status)}`}>
                          {v.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/pass/${v.visitorId}`}
                            className="inline-flex h-8 w-8 items-center justify-center border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
                            title="View / Print Digital Pass"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>

                          {v.status === 'Approved' && (
                            <button
                              onClick={() => checkInVisitor(v.id)}
                              className="inline-flex h-8 w-8 items-center justify-center border border-emerald-200 hover:bg-emerald-500 text-emerald-500 hover:text-black transition-all active:translate-y-0.5"
                              title="Verify Entry (Check In)"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {v.status === 'Checked In' && (
                            <button
                              onClick={() => checkOutVisitor(v.id)}
                              className="inline-flex h-8 w-8 items-center justify-center border border-red-200 hover:bg-red-500 text-red-500 hover:text-white transition-all active:translate-y-0.5"
                              title="Log Exit (Check Out)"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Table footer tally */}
          <div className="bg-zinc-50 dark:bg-zinc-900 px-6 py-3 border-t-2 border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            <span>Showing {filtered.length} files</span>
            <span>Total Campus Registry: {visitors.length} files</span>
          </div>
        </div>

      </main>
    </div>
  );
}
