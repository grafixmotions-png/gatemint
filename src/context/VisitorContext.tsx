'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Visitor, seedVisitors, DEPARTMENTS, VISITOR_TYPES } from '../utils/seedData';

interface RegisterInput {
  fullName: string;
  phone: string;
  email: string;
  visitorType: Visitor['visitorType'];
  purpose: string;
  hostDepartment: string;
  visitDate: string;
  expectedTime: string;
  notes?: string;
  customId?: string;
}

interface VisitorContextType {
  visitors: Visitor[];
  activityLogs: { id: string; text: string; timestamp: string }[];
  isLoaded: boolean;
  registerVisitor: (data: RegisterInput) => Visitor;
  checkInVisitor: (id: string) => void;
  checkOutVisitor: (id: string) => void;
  generateDemoVisitor: () => void;
  simulateRushHour: () => void;
  resetToSeed: () => void;
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

export const useVisitors = () => {
  const context = useContext(VisitorContext);
  if (!context) {
    throw new Error('useVisitors must be used within a VisitorProvider');
  }
  return context;
};

export const VisitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [activityLogs, setActivityLogs] = useState<{ id: string; text: string; timestamp: string }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydration safety: only load from localStorage in useEffect
  useEffect(() => {
    const savedVisitors = localStorage.getItem('gatemint_visitors');
    const savedLogs = localStorage.getItem('gatemint_logs');

    if (savedVisitors) {
      try {
        setVisitors(JSON.parse(savedVisitors));
      } catch (e) {
        setVisitors(seedVisitors);
      }
    } else {
      setVisitors(seedVisitors);
      localStorage.setItem('gatemint_visitors', JSON.stringify(seedVisitors));
    }

    if (savedLogs) {
      try {
        setActivityLogs(JSON.parse(savedLogs));
      } catch (e) {
        setInitialLogs();
      }
    } else {
      setInitialLogs();
    }

    setIsLoaded(true);
  }, []);

  // Listen for changes from other tabs to sync in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gatemint_visitors' && e.newValue) {
        try {
          setVisitors(JSON.parse(e.newValue));
        } catch (err) {
          // Ignore parse errors
        }
      }
      if (e.key === 'gatemint_logs' && e.newValue) {
        try {
          setActivityLogs(JSON.parse(e.newValue));
        } catch (err) {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setInitialLogs = () => {
    const initialLogs = [
      { id: 'l1', text: 'Sarah Jenkins checked in at Engineering Dept', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: 'l2', text: 'David Miller checked in at Computer Lab A', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: 'l3', text: 'Robert Chen checked out of Admissions Office', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: 'l4', text: 'Emily Rodriguez checked out of Registrar Office', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
      { id: 'l5', text: 'Michael Chang checked out of Administration Block', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() }
    ];
    setActivityLogs(initialLogs);
    localStorage.setItem('gatemint_logs', JSON.stringify(initialLogs));
  };

  // Save to localStorage when state changes (only after loaded)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gatemint_visitors', JSON.stringify(visitors));
    }
  }, [visitors, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gatemint_logs', JSON.stringify(activityLogs));
    }
  }, [activityLogs, isLoaded]);

  const addLog = (text: string) => {
    const newLog = {
      id: `l-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  const registerVisitor = (data: RegisterInput & { customId?: string }) => {
    const visitorId = data.customId || `GM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVisitor: Visitor = {
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      visitorId,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      visitorType: data.visitorType,
      purpose: data.purpose,
      hostDepartment: data.hostDepartment,
      visitDate: data.visitDate,
      expectedTime: data.expectedTime,
      qrCodeValue: JSON.stringify({
        id: visitorId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        visitorType: data.visitorType,
        purpose: data.purpose,
        hostDepartment: data.hostDepartment,
        visitDate: data.visitDate,
        expectedTime: data.expectedTime,
        notes: data.notes || '',
        isPayload: true
      }),
      status: 'Approved',
      checkInTime: null,
      checkOutTime: null,
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    setVisitors(prev => [newVisitor, ...prev]);
    addLog(`Pre-registered visitor: ${newVisitor.fullName} (${newVisitor.visitorType})`);
    return newVisitor;
  };

  const checkInVisitor = (id: string) => {
    setVisitors(prev =>
      prev.map(v => {
        if (v.id === id || v.visitorId === id) {
          if (v.status === 'Checked In') return v; // Already checked in
          addLog(`${v.fullName} checked in at ${v.hostDepartment}`);
          return {
            ...v,
            status: 'Checked In',
            checkInTime: new Date().toISOString(),
            checkOutTime: null
          };
        }
        return v;
      })
    );
  };

  const checkOutVisitor = (id: string) => {
    setVisitors(prev =>
      prev.map(v => {
        if (v.id === id || v.visitorId === id) {
          if (v.status !== 'Checked In') return v; // Can only checkout if checked in
          addLog(`${v.fullName} checked out of ${v.hostDepartment}`);
          return {
            ...v,
            status: 'Checked Out',
            checkOutTime: new Date().toISOString()
          };
        }
        return v;
      })
    );
  };

  const generateDemoVisitor = () => {
    const firstNames = ['Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Charlotte', 'Mia', 'Amelia', 'Harper', 'Evelyn'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    const purposes = ['Campus Tour & Admissions', 'Meeting Admissions Director', 'Audit of Labs', 'Guest Lecture Prep', 'Picking up Student', 'Canteen supplies', 'Deliver science lab assets', 'Attend Open Day Expo'];

    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const randomPhone = `+1 555-0${Math.floor(100 + Math.random() * 900)}`;
    const randomEmail = `${randomName.toLowerCase().replace(' ', '.')}@demo-gate.com`;
    const randomType = VISITOR_TYPES[Math.floor(Math.random() * VISITOR_TYPES.length)];
    const randomDept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
    const randomPurpose = purposes[Math.floor(Math.random() * purposes.length)];

    // Expected time between 09:00 and 17:00
    const randomHour = Math.floor(9 + Math.random() * 8).toString().padStart(2, '0');
    const randomMin = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];

    registerVisitor({
      fullName: randomName,
      phone: randomPhone,
      email: randomEmail,
      visitorType: randomType,
      purpose: randomPurpose,
      hostDepartment: randomDept,
      visitDate: new Date().toISOString().split('T')[0],
      expectedTime: `${randomHour}:${randomMin}`,
      notes: 'Auto-generated demo registration.'
    });
  };

  const simulateRushHour = () => {
    const firstNames = ['Jack', 'Jill', 'Mario', 'Luigi', 'Luke', 'Leia', 'Bruce', 'Clark', 'Tony', 'Steve', 'Natasha', 'Clint', 'Wanda', 'Peter', 'Miles', 'Gwen'];
    const lastNames = ['Kent', 'Wayne', 'Stark', 'Rogers', 'Romanoff', 'Barton', 'Maximoff', 'Parker', 'Morales', 'Stacy', 'Banner', 'Odinson', 'Fury'];
    const purposes = ['Open Day Exhibition Attendee', 'Parent Tour Group', 'Student Science Lab Demo', 'Guest Panel Discussion'];

    const count = 5 + Math.floor(Math.random() * 4); // Simulate 5 to 8 checkins
    const newVisitorsList = [...visitors];

    for (let i = 0; i < count; i++) {
      const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const phone = `+1 555-0${Math.floor(100 + Math.random() * 900)}`;
      const email = `${name.toLowerCase().replace(' ', '.')}@rush-gate.com`;
      const type = i % 2 === 0 ? 'Parent' : 'Student';
      const dept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
      const purpose = purposes[Math.floor(Math.random() * purposes.length)];

      const randomIdNum = Math.floor(1000 + Math.random() * 9000);
      const visitorId = `GM-2026-${randomIdNum}`;

      // Simulate check-in times in the last 60 minutes
      const minsAgo = Math.floor(5 + Math.random() * 50);
      const checkInTime = new Date(Date.now() - 1000 * 60 * minsAgo).toISOString();

      const newVisitor: Visitor = {
        id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}-${i}`,
        visitorId,
        fullName: name,
        phone,
        email,
        visitorType: type,
        purpose,
        hostDepartment: dept,
        visitDate: new Date().toISOString().split('T')[0],
        expectedTime: new Date(Date.now() - 1000 * 60 * (minsAgo + 10)).toTimeString().slice(0, 5),
        qrCodeValue: visitorId,
        status: 'Checked In',
        checkInTime,
        checkOutTime: null,
        notes: 'Simulated rush hour arrival.',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
      };

      newVisitorsList.unshift(newVisitor);
    }

    setVisitors(newVisitorsList);
    addLog(`Simulated rush hour: Checked in ${count} new visitors simultaneously.`);
  };

  const resetToSeed = () => {
    setVisitors(seedVisitors);
    setInitialLogs();
  };

  return (
    <VisitorContext.Provider
      value={{
        visitors,
        activityLogs,
        isLoaded,
        registerVisitor,
        checkInVisitor,
        checkOutVisitor,
        generateDemoVisitor,
        simulateRushHour,
        resetToSeed
      }}
    >
      {children}
    </VisitorContext.Provider>
  );
};
