
import React, { createContext, useContext, ReactNode } from 'react';
import { useActiveCalls } from '@/hooks/use-active-calls';

interface ActiveCallsContextType {
  activeCalls: any[];
  activeCallLeadIds: string[];
  isLoading: boolean;
  isLeadOnCall: (leadId: string) => boolean;
  getActiveCallForLead: (leadId: string) => any;
}

const ActiveCallsContext = createContext<ActiveCallsContextType | undefined>(undefined);

export function ActiveCallsProvider({ children }: { children: ReactNode }) {
  const activeCallsData = useActiveCalls();

  return (
    <ActiveCallsContext.Provider value={activeCallsData}>
      {children}
    </ActiveCallsContext.Provider>
  );
}

export function useActiveCallsContext() {
  const context = useContext(ActiveCallsContext);
  if (context === undefined) {
    throw new Error('useActiveCallsContext must be used within an ActiveCallsProvider');
  }
  return context;
}
