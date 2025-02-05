// src/types/websocket.ts
export interface WebSocketMessage {
    type: 'task_state_update' | 'task_start' | 'task_complete' | 'task_cancelled' | 'task_error' | 'task_log';
    serverType?: number;
    state?: boolean;
    value?: string;
    message?: string;
}