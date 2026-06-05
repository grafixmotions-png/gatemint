'use client';

import React, { useState } from 'react';
import { useVisitors } from '@/context/VisitorContext';
import { DEPARTMENTS, VISITOR_TYPES, Visitor } from '@/utils/seedData';
import { Shield, Sparkles, ClipboardCheck, ArrowRight, User, Phone, Mail, FileText, Calendar, Clock, X } from 'lucide-react';
import VisitorPass from '@/components/VisitorPass';

export default function Register() {
  const { registerVisitor } = useVisitors();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    visitorType: 'Parent' as Visitor['visitorType'],
    purpose: '',
    hostDepartment: DEPARTMENTS[0],
    visitDate: new Date().toISOString().split('T')[0],
    expectedTime: new Date().toTimeString().slice(0, 5),
    idNumber: '',
    notes: ''
  });

  const [registeredPass, setRegisteredPass] = useState<Visitor | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct final registration data
    const newPass = registerVisitor({
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      visitorType: formData.visitorType,
      purpose: formData.purpose,
      hostDepartment: formData.hostDepartment,
      visitDate: formData.visitDate,
      expectedTime: formData.expectedTime,
      notes: formData.notes ? `${formData.notes}${formData.idNumber ? ` [ID: ${formData.idNumber}]` : ''}` : formData.idNumber ? `[ID: ${formData.idNumber}]` : ''
    });

    setRegisteredPass(newPass);
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Reset Form
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      visitorType: 'Parent',
      purpose: '',
      hostDepartment: DEPARTMENTS[0],
      visitDate: new Date().toISOString().split('T')[0],
      expectedTime: new Date().toTimeString().slice(0, 5),
      idNumber: '',
      notes: ''
    });
    setRegisteredPass(null);
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black/95 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-10 w-10 border-2 border-black dark:border-white bg-black dark:bg-zinc-900 items-center justify-center text-emerald-500 mb-3 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">
            Visitor Pre-Registration
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-sm mx-auto font-medium">
            Fill in the details below to generate a digital QR campus pass.
          </p>
        </div>

        {/* Form Card */}
        <div className="neo-card bg-white dark:bg-zinc-950 p-6 sm:p-8 border-2 border-black dark:border-zinc-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1">
                <User className="h-3 w-3 text-emerald-500" /> Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Sarah Jenkins"
                className="w-full text-sm border-2 border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 bg-transparent focus:border-emerald-500 outline-none text-black dark:text-white"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-emerald-500" /> Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 555-0182"
                  className="w-full text-sm border-2 border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 bg-transparent focus:border-emerald-500 outline-none text-black dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1">
                  <Mail className="h-3 w-3 text-emerald-500" /> Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. sarah.j@outlook.com"
                  className="w-full text-sm border-2 border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 bg-transparent focus:border-emerald-500 outline-none text-black dark:text-white"
                />
              </div>
            </div>

            {/* Visitor Type & Host Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="visitorType" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Visitor Type *
                </label>
                <select
                  id="visitorType"
                  name="visitorType"
                  value={formData.visitorType}
                  onChange={handleChange}
                  className="w-full text-sm border-2 border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 bg-transparent dark:bg-zinc-950 focus:border-emerald-500 outline-none text-black dark:text-white"
                >
                  {VISITOR_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="hostDepartment" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Department to Visit *
                </label>
                <select
                  id="hostDepartment"
                  name="hostDepartment"
                  value={formData.hostDepartment}
                  onChange={handleChange}
                  className="w-full text-sm border-2 border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 bg-transparent dark:bg-zinc-950 focus:border-emerald-500 outline-none text-black dark:text-white"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visit Date & Expected Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="visitDate" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-emerald-500" /> Visit Date *
                </label>
                <input
                  type="date"
                  id="visitDate"
                  name="visitDate"
                  required
                  value={formData.visitDate}
                  onChange={handleChange}
                  className="w-full text-sm border-2 border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 bg-transparent focus:border-emerald-500 outline-none text-black dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="expectedTime" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-emerald-500" /> Expected Arrival *
                </label>
                <input
                  type="time"
                  id="expectedTime"
                  name="expectedTime"
                  required
                  value={formData.expectedTime}
                  onChange={handleChange}
                  className="w-full text-sm border-2 border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 bg-transparent focus:border-emerald-500 outline-none text-black dark:text-white"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label htmlFor="purpose" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1">
                <FileText className="h-3 w-3 text-emerald-500" /> Purpose of Visit *
              </label>
              <input
                type="text"
                id="purpose"
                name="purpose"
                required
                value={formData.purpose}
                onChange={handleChange}
                placeholder="e.g. Guest Lecture, Lab Inspection"
                className="w-full text-sm border-2 border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 bg-transparent focus:border-emerald-500 outline-none text-black dark:text-white"
              />
            </div>

            {/* Optional ID Number */}
            <div>
              <label htmlFor="idNumber" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                Government ID Number <span className="text-[10px] text-zinc-400">(Optional)</span>
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="e.g. Driver's License or SSN last 4 digits"
                className="w-full text-sm border-2 border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 bg-transparent focus:border-emerald-500 outline-none text-black dark:text-white"
              />
            </div>

            {/* Optional Notes */}
            <div>
              <label htmlFor="notes" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                Additional Notes / Accommodations <span className="text-[10px] text-zinc-400">(Optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Wheelchair access needed, parking code query"
                className="w-full text-sm border-2 border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 bg-transparent focus:border-emerald-500 outline-none text-black dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center text-sm font-bold h-11 border-2 border-emerald-500 bg-emerald-500 text-black hover:bg-emerald-600 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer"
            >
              Generate Campus Pass <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Success Modal */}
      {showSuccessModal && registeredPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto print:static print:bg-transparent print:p-0 print:block">
          <div className="relative max-w-lg w-full bg-white dark:bg-zinc-950 border-2 border-emerald-500 p-6 shadow-[8px_8px_0px_0px_rgba(16,185,129,0.3)] my-8 print:border-none print:shadow-none print:p-0 print:my-0 print:bg-transparent">
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Headline and Check */}
            <div className="text-center mb-6 no-print">
              <div className="inline-flex h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 items-center justify-center text-emerald-500 mb-2">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-black dark:text-white leading-tight">
                Visitor Registered Successfully!
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Your digital QR pass has been generated below.
              </p>
            </div>

            {/* Pass Render */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4">
              <VisitorPass visitor={registeredPass} triggerConfetti={true} onBackClick={handleCloseModal} />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
