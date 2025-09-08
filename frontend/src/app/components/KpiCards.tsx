"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// IMPORT THE NEW SHARED TYPES
import { AgentData, AgentState } from '@/hooks/useSimulationSocket';

interface KpiCardsProps {
  data: AgentData | null; // Use the shared AgentData type
}

const KpiCard = ({ title, inventory, backlog }: { title: string, inventory: number, backlog: number }) => (
  <Card className="bg-gray-950/70 border-gray-800 text-white transition-all duration-300 hover:border-amber-400/50">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-amber-400">{inventory}</div>
      <p className="text-xs text-red-500/80">Backlog: {backlog}</p>
    </CardContent>
  </Card>
);

export const KpiCards: React.FC<KpiCardsProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="Retailer Inventory" inventory={data.Retailer.inventory} backlog={data.Retailer.backlog} />
      <KpiCard title="Wholesaler Inventory" inventory={data.Wholesaler.inventory} backlog={data.Wholesaler.backlog} />
      <KpiCard title="Distributor Inventory" inventory={data.Distributor.inventory} backlog={data.Distributor.backlog} />
      <KpiCard title="Factory Inventory" inventory={data.Factory.inventory} backlog={data.Factory.backlog} />
    </div>
  );
};