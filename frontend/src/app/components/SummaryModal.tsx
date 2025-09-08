"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinalSummaryMessage {
    type: 'final_summary';
    title: string;
    summary_text: string;
    chart_type: 'bar';
    chart_data: { name: string, cost: number }[];
}

interface SummaryModalProps {
  summaryData: FinalSummaryMessage | null;
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ summaryData, onClose }) => {
  if (!summaryData) return null;

  return (
    <Dialog open={!!summaryData} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[625px] bg-gray-950 text-white border-amber-400/50">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-2xl">{summaryData.title}</DialogTitle>
          <DialogDescription className="text-gray-400">{summaryData.summary_text}</DialogDescription>
        </DialogHeader>
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryData.chart_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                labelStyle={{ color: '#FBBF24' }}
              />
              <Bar dataKey="cost" fill="#FBBF24" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};