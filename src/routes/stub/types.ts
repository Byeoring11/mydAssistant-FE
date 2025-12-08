/**
 * Stub 모듈 타입 정의
 */

export type StepStatus = 'idle' | 'running' | 'success' | 'error';

export interface TimerState {
	min: string;
	sec: string;
	msec: string;
}

export interface ServerHealth {
	server_name: string;
	host: string;
	is_healthy: boolean;
	last_checked: string;
	consecutive_failures: number;
	consecutive_successes: number;
}

export interface WorkflowState {
	step1: StepStatus;
	step2: StepStatus;
	step3: StepStatus;
}

export interface SessionStatus {
	active: boolean;
	owner: string | null;
}

export interface StubState {
	// WebSocket 연결 상태
	connected: boolean;
	connectionId: string | null;

	// 세션 상태
	sessionStatus: SessionStatus;

	// 서버 Health 상태
	serverHealth: Record<string, ServerHealth>;

	// Workflow 진행 상태
	workflow: WorkflowState;

	// 타이머 상태
	totalTimer: TimerState;
	step1Timer: TimerState;
	step2Timer: TimerState;
	step3Timer: TimerState;

	// 출력 로그
	outputLogs: string[];

	// 입력 설정
	customerNumbers: string[];
}
