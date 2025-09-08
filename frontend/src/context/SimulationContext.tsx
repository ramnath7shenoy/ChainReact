"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useSimulationSocket } from '@/hooks/useSimulationSocket';

type SimulationContextType = ReturnType<typeof useSimulationSocket>;

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const simulationData = useSimulationSocket();

  return (
    <SimulationContext.Provider value={simulationData}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};