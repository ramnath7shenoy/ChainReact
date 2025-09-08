"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Info, TriangleAlert } from "lucide-react";
import { EventMessage } from '@/hooks/useSimulationSocket';

const eventIcons = {
  INFO: <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />,
  WARNING: <TriangleAlert className="h-4 w-4 text-amber-400 flex-shrink-0" />,
  CRITICAL: <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />,
};

export const AnalystPanel: React.FC<{ eventHistory: EventMessage[] }> = ({ eventHistory }) => {
  return (
    <Card className="bg-gray-950/70 border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-amber-400">Live Event Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 w-full pr-4">
          <div className="space-y-4">
            {eventHistory.length === 0 && (
              <p className="text-sm text-gray-500 font-mono"> &gt; Standing by for system events...</p>
            )}
            {eventHistory.map((event, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="mt-1">{eventIcons[event.type]}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">
                    <span className="font-bold text-gray-500">W{event.week}:</span> {event.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};