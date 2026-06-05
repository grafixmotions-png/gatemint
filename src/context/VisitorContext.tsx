'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Visitor, seedVisitors, DEPARTMENTS, VISITOR_TYPES } from '../utils/seedData';
import { supabase } from '@/lib/supabase';

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

// Database mapper helpers
function mapDbVisitorToVisitor(db: any): Visitor {
  return {
    id: db.id,
    visitorId: db.visitor_id,
    fullName: db.full_name,
    phone: db.phone,
    email: db.email,
    visitorType: db.visitor_type as Visitor['visitorType'],
    purpose: db.purpose,
    hostDepartment: db.host_department,
    visitDate: db.visit_date,
    expectedTime: db.expected_time,
    qrCodeValue: db.qr_code_value,
    status: db.status as Visitor['status'],
    checkInTime: db.check_in_time,
    checkOutTime: db.check_out_time,
    notes: db.notes || '',
    createdAt: db.created_at
  };
}

export const VisitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [activityLogs, setActivityLogs] = useState<{ id: string; text: string; timestamp: string }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch functions for Supabase mode
  const fetchVisitors = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching visitors:', error);
      return;
    }

    if (data && data.length > 0) {
      setVisitors(data.map(mapDbVisitorToVisitor));
    } else {
      // Auto-seed if the database is completely empty on load
      await seedSupabaseDatabase();
    }
  };

  const fetchLogs = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching logs:', error);
      return;
    }

    if (data) {
      setActivityLogs(data.map((l: any) => ({
        id: l.id,
        text: l.text,
        timestamp: l.timestamp
      })));
    }
  };

  const seedSupabaseDatabase = async () => {
    if (!supabase) return;
    console.log('Database empty. Seeding initial visitors and logs...');
    
    // Convert seed data to DB column format
    const dbVisitors = seedVisitors.map(v => ({
      visitor_id: v.visitorId,
      full_name: v.fullName,
      phone: v.phone,
      email: v.email,
      visitor_type: v.visitorType,
      purpose: v.purpose,
      host_department: v.hostDepartment,
      visit_date: v.visitDate,
      expected_time: v.expectedTime,
      qr_code_value: v.qrCodeValue,
      status: v.status,
      check_in_time: v.checkInTime,
      check_out_time: v.checkOutTime,
      notes: v.notes,
      created_at: v.createdAt
    }));

    const { error: visitorsError } = await supabase
      .from('visitors')
      .insert(dbVisitors);
    
    if (visitorsError) {
      console.error('Error seeding visitors:', visitorsError);
      return;
    }

    // Seed activity logs
    const initialLogs = [
      { text: 'Sarah Jenkins checked in at Engineering Dept', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { text: 'David Miller checked in at Computer Lab A', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { text: 'Robert Chen checked out of Admissions Office', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { text: 'Emily Rodriguez checked out of Registrar Office', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
      { text: 'Michael Chang checked out of Administration Block', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() }
    ];

    const { error: logsError } = await supabase
      .from('activity_logs')
      .insert(initialLogs);
    
    if (logsError) {
      console.error('Error seeding logs:', logsError);
    }
    
    // Fetch newly seeded data
    await Promise.all([fetchVisitors(), fetchLogs()]);
  };

  // Initial mount hook: sets up Supabase realtime OR falls back to LocalStorage
  useEffect(() => {
    if (supabase) {
      const client = supabase;
      console.log('Supabase client detected. Connecting to cloud database...');
      
      // Fetch initial data then set isLoaded
      Promise.all([fetchVisitors(), fetchLogs()]).finally(() => {
        setIsLoaded(true);
      });

      // Subscribe to real-time events on visitors and activity_logs
      const channel = client
        .channel('gatemint-db-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'visitors' },
          () => {
            fetchVisitors();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'activity_logs' },
          () => {
            fetchLogs();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    } else {
      console.warn('Supabase URL/Key missing. GateMint is operating in localStorage fallback mode.');
      
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
    }
  }, []);

  // Sync state to local storage when running in fallback mode
  useEffect(() => {
    if (isLoaded && !supabase) {
      localStorage.setItem('gatemint_visitors', JSON.stringify(visitors));
    }
  }, [visitors, isLoaded]);

  useEffect(() => {
    if (isLoaded && !supabase) {
      localStorage.setItem('gatemint_logs', JSON.stringify(activityLogs));
    }
  }, [activityLogs, isLoaded]);

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

  // Sync-safe Activity Logger
  const addLog = async (text: string) => {
    if (supabase) {
      const { error } = await supabase
        .from('activity_logs')
        .insert({ text });
      if (error) console.error('Error inserting activity log:', error);
    } else {
      const newLog = {
        id: `l-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        text,
        timestamp: new Date().toISOString()
      };
      setActivityLogs(prev => [newLog, ...prev].slice(0, 50));
    }
  };

  // Sync-safe Registration
  const registerVisitor = (data: RegisterInput & { customId?: string }) => {
    const visitorId = data.customId || `GM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrCodeValueStr = JSON.stringify({
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
    });

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
      qrCodeValue: qrCodeValueStr,
      status: 'Approved',
      checkInTime: null,
      checkOutTime: null,
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      // Supabase auto-generates the primary key UUID; we omit `id` to avoid UUID cast errors.
      const dbInsert = {
        visitor_id: visitorId,
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        visitor_type: data.visitorType,
        purpose: data.purpose,
        host_department: data.hostDepartment,
        visit_date: data.visitDate,
        expected_time: data.expectedTime,
        qr_code_value: qrCodeValueStr,
        status: 'Approved',
        notes: data.notes || ''
      };

      // Asynchronous insert; realtime listener will update the list
      supabase
        .from('visitors')
        .insert(dbInsert)
        .then(({ error }) => {
          if (error) console.error('Error inserting visitor:', error);
          else addLog(`Pre-registered visitor: ${data.fullName} (${data.visitorType})`);
        });

      return newVisitor; // Return optimistically for immediate client modal rendering
    } else {
      setVisitors(prev => [newVisitor, ...prev]);
      addLog(`Pre-registered visitor: ${newVisitor.fullName} (${newVisitor.visitorType})`);
      return newVisitor;
    }
  };

  // Sync-safe Check-In
  const checkInVisitor = async (id: string) => {
    const checkInTimeStr = new Date().toISOString();
    const targetVisitor = visitors.find(v => v.id === id || v.visitorId === id);
    if (!targetVisitor) return;

    if (supabase) {
      const { error } = await supabase
        .from('visitors')
        .update({
          status: 'Checked In',
          check_in_time: checkInTimeStr,
          check_out_time: null
        })
        .or(`id.eq.${id},visitor_id.eq.${id}`);

      if (error) {
        console.error('Error checking in visitor:', error);
      } else {
        await addLog(`${targetVisitor.fullName} checked in at ${targetVisitor.hostDepartment}`);
      }
    } else {
      setVisitors(prev =>
        prev.map(v => {
          if (v.id === id || v.visitorId === id) {
            if (v.status === 'Checked In') return v;
            addLog(`${v.fullName} checked in at ${v.hostDepartment}`);
            return {
              ...v,
              status: 'Checked In',
              checkInTime: checkInTimeStr,
              checkOutTime: null
            };
          }
          return v;
        })
      );
    }
  };

  // Sync-safe Check-Out
  const checkOutVisitor = async (id: string) => {
    const checkOutTimeStr = new Date().toISOString();
    const targetVisitor = visitors.find(v => v.id === id || v.visitorId === id);
    if (!targetVisitor) return;

    if (supabase) {
      const { error } = await supabase
        .from('visitors')
        .update({
          status: 'Checked Out',
          check_out_time: checkOutTimeStr
        })
        .or(`id.eq.${id},visitor_id.eq.${id}`);

      if (error) {
        console.error('Error checking out visitor:', error);
      } else {
        await addLog(`${targetVisitor.fullName} checked out of ${targetVisitor.hostDepartment}`);
      }
    } else {
      setVisitors(prev =>
        prev.map(v => {
          if (v.id === id || v.visitorId === id) {
            if (v.status !== 'Checked In') return v;
            addLog(`${v.fullName} checked out of ${v.hostDepartment}`);
            return {
              ...v,
              status: 'Checked Out',
              checkOutTime: checkOutTimeStr
            };
          }
          return v;
        })
      );
    }
  };

  // Sync-safe Single Demo Generation
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

  // Sync-safe Rush Hour Simulation
  const simulateRushHour = async () => {
    const firstNames = ['Jack', 'Jill', 'Mario', 'Luigi', 'Luke', 'Leia', 'Bruce', 'Clark', 'Tony', 'Steve', 'Natasha', 'Clint', 'Wanda', 'Peter', 'Miles', 'Gwen'];
    const lastNames = ['Kent', 'Wayne', 'Stark', 'Rogers', 'Romanoff', 'Barton', 'Maximoff', 'Parker', 'Morales', 'Stacy', 'Banner', 'Odinson', 'Fury'];
    const purposes = ['Open Day Exhibition Attendee', 'Parent Tour Group', 'Student Science Lab Demo', 'Guest Panel Discussion'];

    const count = 5 + Math.floor(Math.random() * 4); // Simulate 5 to 8 checkins
    
    if (supabase) {
      const dbInserts = [];
      for (let i = 0; i < count; i++) {
        const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const phone = `+1 555-0${Math.floor(100 + Math.random() * 900)}`;
        const email = `${name.toLowerCase().replace(' ', '.')}@rush-gate.com`;
        const type = i % 2 === 0 ? 'Parent' : 'Student';
        const dept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
        const purpose = purposes[Math.floor(Math.random() * purposes.length)];

        const randomIdNum = Math.floor(1000 + Math.random() * 9000);
        const visitorId = `GM-2026-${randomIdNum}`;

        const minsAgo = Math.floor(5 + Math.random() * 50);
        const checkInTime = new Date(Date.now() - 1000 * 60 * minsAgo).toISOString();
        const expectedTimeStr = new Date(Date.now() - 1000 * 60 * (minsAgo + 10)).toTimeString().slice(0, 5);

        const qrCodeValueStr = JSON.stringify({
          id: visitorId,
          fullName: name,
          phone,
          email,
          visitorType: type,
          purpose,
          hostDepartment: dept,
          visitDate: new Date().toISOString().split('T')[0],
          expectedTime: expectedTimeStr,
          notes: 'Simulated rush hour arrival.',
          isPayload: true
        });

        dbInserts.push({
          visitor_id: visitorId,
          full_name: name,
          phone,
          email,
          visitor_type: type,
          purpose,
          host_department: dept,
          visit_date: new Date().toISOString().split('T')[0],
          expected_time: expectedTimeStr,
          qr_code_value: qrCodeValueStr,
          status: 'Checked In',
          check_in_time: checkInTime,
          created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          notes: 'Simulated rush hour arrival.'
        });
      }

      const { error } = await supabase
        .from('visitors')
        .insert(dbInserts);
      
      if (error) {
        console.error('Error simulating rush hour:', error);
      } else {
        await addLog(`Simulated rush hour: Checked in ${count} new visitors simultaneously.`);
      }
    } else {
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
    }
  };

  // Sync-safe Reset database function
  const resetToSeed = async () => {
    if (supabase) {
      console.log('Resetting database to seed visitors...');
      
      const { error: deleteVisitorsError } = await supabase
        .from('visitors')
        .delete()
        .neq('visitor_id', ''); // clears all entries
      
      const { error: deleteLogsError } = await supabase
        .from('activity_logs')
        .delete()
        .neq('text', ''); // clears all entries
      
      if (deleteVisitorsError || deleteLogsError) {
        console.error('Error clearing database for reset:', deleteVisitorsError || deleteLogsError);
        return;
      }
      
      await seedSupabaseDatabase();
      await addLog('Reset database to initial seed data');
    } else {
      setVisitors(seedVisitors);
      setInitialLogs();
    }
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
