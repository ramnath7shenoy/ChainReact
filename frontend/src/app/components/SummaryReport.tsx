"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FinalSummaryMessage } from '@/hooks/useSimulationSocket';

const COLORS = ['#FBBF24', '#F87171']; // Gold for Holding Cost, Red for Stockout

export const SummaryReport: React.FC<{ summaryData: FinalSummaryMessage }> = ({ summaryData }) => {
  return (
    <Card className="bg-gray-950/70 border-gray-800 text-white mt-8">
        <CardHeader>
          <CardTitle className="text-amber-400 text-3xl">{summaryData.title}</CardTitle>
          <CardDescription className="text-gray-400 pt-2">{summaryData.summary_text}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="lg:col-span-2">
                    <h4 className="text-lg font-semibold mb-2">Total Costs per Agent</h4>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summaryData.total_cost_data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                                <Bar dataKey="cost" fill="#FBBF24" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-2">Retailer Cost Breakdown</h4>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie data={summaryData.cost_breakdown_data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {summaryData.cost_breakdown_data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="mt-8">
                <h4 className="text-lg font-semibold mb-2">Retailer Inventory Stability</h4>
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={summaryData.inventory_stability_data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                            <XAxis dataKey="week" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                            <Line type="monotone" dataKey="inventory" name="Retailer Inventory" stroke="#34D399" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};