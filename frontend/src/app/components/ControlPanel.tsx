"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface ControlPanelProps {
    simulationId: string | null;
    isRunning: boolean;
    startSimulation: (args: { config: Record<string, string>, weeks: number }) => void;
    apiBaseUrl: string; // <-- NEW PROP
}

interface DisruptionEvent {
  type: "DEMAND_SPIKE";
  value: number;
  duration: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ simulationId, isRunning, startSimulation, apiBaseUrl }) => {
    const [numWeeks, setNumWeeks] = useState(50);
    const [agentConfig, setAgentConfig] = useState({
        "Retailer": "RULE", "Wholesaler": "RULE", "Distributor": "RULE",
    });

    const handleToggle = (agentName: string, isAi: boolean) => {
        setAgentConfig(prev => ({ ...prev, [agentName]: isAi ? "AI" : "RULE" }));
    };
    const handleStart = () => {
        startSimulation({ config: agentConfig, weeks: numWeeks });
    };

    const handleDisrupt = async () => {
        if (!simulationId) return;
        const event: DisruptionEvent = { type: "DEMAND_SPIKE", value: 80, duration: 3 };
        try {
          // UPDATED: Use the dynamic apiBaseUrl prop
          await fetch(`${apiBaseUrl}/simulation/${simulationId}/disrupt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
          });
        } catch (error) {
          console.error("Disruption error:", error);
        }
    };

    return (
        <Card className="bg-gray-950/70 border-gray-800 text-white">
            <CardHeader>
                <CardTitle className="text-amber-400">Control Panel</CardTitle>
                <CardDescription className="text-gray-400">Configure and control the simulation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="weeks">Simulation Weeks</Label>
                        <Input
                            id="weeks" type="number" value={numWeeks}
                            onChange={(e) => setNumWeeks(parseInt(e.target.value, 10) || 50)}
                            className="mt-2 bg-gray-900 border-gray-700" disabled={isRunning}
                        />
                    </div>
                    <h4 className="font-semibold text-gray-200 pt-2">Agent Intelligence</h4>
                    {Object.keys(agentConfig).map((name) => (
                        <div key={name} className="flex items-center justify-between">
                            <Label htmlFor={`ai-toggle-${name}`}>{name}</Label>
                            <Switch
                                id={`ai-toggle-${name}`}
                                checked={agentConfig[name as keyof typeof agentConfig] === "AI"}
                                onCheckedChange={(checked) => handleToggle(name, checked)}
                                disabled={isRunning}
                            />
                        </div>
                    ))}
                </div>
                <Button onClick={handleStart} disabled={isRunning} className="w-full bg-amber-500 text-black font-bold hover:bg-amber-400 disabled:bg-slate-700 disabled:text-gray-400">
                    Start Simulation
                </Button>
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-200">Inject Disruption</h4>
                    <Button onClick={handleDisrupt} disabled={!isRunning} variant="destructive" className="w-full bg-red-800/80 border border-red-600 hover:bg-red-700 hover:border-red-500 text-white font-bold disabled:bg-slate-700 disabled:text-gray-400 disabled:border-slate-600">
                        Trigger Demand Spike
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};