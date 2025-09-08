"use client";

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useSimulation } from '@/context/SimulationContext';

export const ChainChart = () => {
  const { dataHistory, connectionStatus } = useSimulation();

  const connectionStatusText = {
  }[connectionStatus];

  const chartData = dataHistory.map(weekData => ({
    week: `Week ${weekData.week}`,
    Retailer: weekData.agents.Retailer.placed_order_amount,
    Wholesaler: weekData.agents.Wholesaler.placed_order_amount,
    Distributor: weekData.agents.Distributor.placed_order_amount,
    Factory: weekData.agents.Factory.placed_order_amount,
  }));

  return (
    <div className="w-full h-96 bg-gray-950/70 border border-gray-800 p-4 rounded-xl shadow-lg">
      <h2 className="text-white text-lg mb-2">{connectionStatusText}</h2>
      <LineChart
        width={800}
        height={350}
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
        <XAxis dataKey="week" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#F3F4F6' }}
          labelStyle={{ color: '#FBBF24' }}
        />
        <Legend wrapperStyle={{ color: '#E5E7EB' }} />
        <Line type="monotone" dataKey="Retailer" stroke="#FBBF24" strokeWidth={2} dot={false} animationDuration={300} />
        <Line type="monotone" dataKey="Wholesaler" stroke="#34D399" strokeWidth={2} dot={false} animationDuration={300} />
        <Line type="monotone" dataKey="Distributor" stroke="#F87171" strokeWidth={2} dot={false} animationDuration={300} />
        <Line type="monotone" dataKey="Factory" stroke="#60A5FA" strokeWidth={2} dot={false} animationDuration={300} />
      </LineChart>
    </div>
  );
};