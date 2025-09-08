"use client";

import dynamic from 'next/dynamic';
import { ControlPanel } from "@/app/components/ControlPanel";
import { KpiCards } from "@/app/components/KpiCards";
import { AnalystPanel } from "@/app/components/AnalystPanel";
import { SummaryReport } from "@/app/components/SummaryReport";
import { useSimulation } from "@/context/SimulationContext";

const ChainChart = dynamic(
  () => import('@/app/components/ChainChart').then(mod => mod.ChainChart),
  {
    ssr: false,
    loading: () => <div className="w-full h-96 bg-gray-950/70 border-gray-800 rounded-xl flex items-center justify-center"><p className="text-gray-400">Loading Chart...</p></div>
  }
);

export default function Home() {
  const { 
    simulationId, 
    dataHistory, 
    startSimulation, 
    eventHistory,
    summaryData,
  } = useSimulation();
  
  const isRunning = !!simulationId && !summaryData;
  const latestData = dataHistory.length > 0 ? dataHistory[dataHistory.length - 1].agents : null;

  return (
    <main className="min-h-screen w-full bg-black text-gray-200 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Chain<span className="text-amber-400">React</span> Simulation
          </h1>
          <p className="text-lg md:text-xl text-gray-400">
            An Interactive Digital Twin of a Supply Chain
          </p>
        </div>

        <div className="mb-8">
          <KpiCards data={latestData} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <ControlPanel
              simulationId={simulationId}
              isRunning={isRunning}
              startSimulation={startSimulation}
            />
            <AnalystPanel eventHistory={eventHistory} />
          </div>
          <div className="lg:col-span-3">
            <ChainChart />
          </div>
        </div>
        
        {summaryData && (
          <div className="mt-8">
            <SummaryReport summaryData={summaryData} />
          </div>
        )}
      </div>
    </main>
  );
}