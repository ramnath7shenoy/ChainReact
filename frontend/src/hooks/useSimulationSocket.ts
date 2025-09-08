"use client";
import { useState, useEffect, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export interface AgentState {
    inventory: number;
    placed_order_amount: number;
    backlog: number;
    cost: number;
}
export interface EventMessage {
    week: number;
    type: 'INFO' | 'WARNING' | 'CRITICAL';
    text: string;
}
export interface AgentData {
  Retailer: AgentState;
  Wholesaler: AgentState;
  Distributor: AgentState;
  Factory: AgentState;
}
export interface SimulationMessage {
    week: number;
    agents: AgentData;
    analysis?: string;
    events?: EventMessage[];
    type?: undefined;
}
export interface SimulationIdMessage {
    type: 'simulation_id';
    id: string;
}
export interface FinalSummaryMessage {
    type: 'final_summary';
    title: string;
    summary_text: string;
    total_cost_data: { name: string, cost: number }[];
    inventory_stability_data: { week: number, inventory: number }[];
    cost_breakdown_data: { name: string, value: number }[];
}

type WebSocketMessage = SimulationMessage | SimulationIdMessage | FinalSummaryMessage;

export const useSimulationSocket = () => {
    const SIMULATION_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://127.0.0.1:8000/ws/simulation';

    const [simulationId, setSimulationId] = useState<string | null>(null);
    const [dataHistory, setDataHistory] = useState<SimulationMessage[]>([]);
    const [eventHistory, setEventHistory] = useState<EventMessage[]>([]);
    const [summaryData, setSummaryData] = useState<FinalSummaryMessage | null>(null);

    const { lastJsonMessage, readyState, sendJsonMessage } = useWebSocket(SIMULATION_URL, {
        shouldReconnect: (_closeEvent) => true,
        onClose: () => {
          setSimulationId(null);
        }
    });

    const startSimulation = useCallback((args: { config: Record<string, string>, weeks: number }) => {
        setDataHistory([]); 
        setEventHistory([]);
        setSummaryData(null);
        sendJsonMessage({ type: "start_simulation", config: args.config, weeks: args.weeks });
    }, [sendJsonMessage]);

    useEffect(() => {
        if (lastJsonMessage) {
            const message = lastJsonMessage as WebSocketMessage;

            if (message.type === 'simulation_id') {
                setSimulationId(message.id);
            } else if (message.type === 'final_summary') {
                setSummaryData(message);
            } else if (message.agents) {
                setDataHistory((prev) => [...prev, message]);
                if (message.events) {
                    setEventHistory(prev => [...prev, ...message.events!]);
                }
            }
        }
    }, [lastJsonMessage]);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting...',
        [ReadyState.OPEN]: 'Live Simulation Running',
        [ReadyState.CLOSING]: 'Closing...',
        [ReadyState.CLOSED]: 'Disconnected',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return { dataHistory, connectionStatus, simulationId, startSimulation, eventHistory, summaryData, setSummaryData };
};