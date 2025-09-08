"use client";
import { useState, useEffect, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

// All interface definitions are the same
export interface AgentState { /* ... */ }
export interface EventMessage { /* ... */ }
export interface AgentData { /* ... */ }
export interface SimulationMessage { /* ... */ }
export interface SimulationIdMessage { /* ... */ }
export interface FinalSummaryMessage { /* ... */ }
type WebSocketMessage = SimulationMessage | SimulationIdMessage | FinalSummaryMessage;

export const useSimulationSocket = () => {
    const SIMULATION_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://127.0.0.1:8001/ws/simulation';

    // NEW: Derive the API base URL from the WebSocket URL
    const apiBaseUrl = SIMULATION_URL
        .replace('ws://', 'http://')
        .replace('wss://', 'https://')
        .replace('/ws/simulation', '');

    const [simulationId, setSimulationId] = useState<string | null>(null);
    const [dataHistory, setDataHistory] = useState<SimulationMessage[]>([]);
    const [eventHistory, setEventHistory] = useState<EventMessage[]>([]);
    const [summaryData, setSummaryData] = useState<FinalSummaryMessage | null>(null);

    const { lastJsonMessage, readyState, sendJsonMessage } = useWebSocket(SIMULATION_URL, {
        shouldReconnect: (_closeEvent) => true,
        onClose: () => { setSimulationId(null); }
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
            if (message.type === 'simulation_id') { setSimulationId(message.id); }
            else if (message.type === 'final_summary') { setSummaryData(message); }
            else if (message.agents) {
                setDataHistory((prev) => [...prev, message]);
                if (message.events) { setEventHistory(prev => [...prev, ...message.events!]); }
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

    // Add apiBaseUrl to the return object
    return { dataHistory, connectionStatus, simulationId, startSimulation, eventHistory, summaryData, setSummaryData, apiBaseUrl };
};