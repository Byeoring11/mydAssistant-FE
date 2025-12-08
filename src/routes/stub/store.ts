/**
 * Stub WebSocket Store
 * - WebSocket 상태 및 작업 진행 상태 관리
 */

import { writable, derived, get } from 'svelte/store';
import type {
	StepStatus,
	ServerHealth,
	WorkflowState,
	SessionStatus,
	StubState,
	TimerState
} from './types';

// ============ Initial State ============

const INITIAL_TIMER: TimerState = { min: '00', sec: '00', msec: '00' };

const initialState: StubState = {
	connected: false,
	connectionId: null,
	sessionStatus: {
		active: false,
		owner: null
	},
	serverHealth: {},
	workflow: {
		step1: 'idle',
		step2: 'idle',
		step3: 'idle'
	},
	totalTimer: { ...INITIAL_TIMER },
	step1Timer: { ...INITIAL_TIMER },
	step2Timer: { ...INITIAL_TIMER },
	step3Timer: { ...INITIAL_TIMER },
	outputLogs: [],
	customerNumbers: []
};

// ============ Store ============

function createStubStore() {
	const { subscribe, set, update } = writable<StubState>(initialState);

	return {
		subscribe,

		// WebSocket 연결 관련
		setConnected: (connected: boolean, connectionId: string | null = null) =>
			update(state => ({ ...state, connected, connectionId })),

		// 세션 상태 업데이트
		setSessionStatus: (sessionStatus: SessionStatus) =>
			update(state => ({ ...state, sessionStatus })),

		// 서버 Health 업데이트
		updateServerHealth: (serverName: string, health: ServerHealth) =>
			update(state => ({
				...state,
				serverHealth: {
					...state.serverHealth,
					[serverName]: health
				}
			})),

		setAllServerHealth: (serverHealth: Record<string, ServerHealth>) =>
			update(state => ({ ...state, serverHealth })),

		// Workflow 상태 업데이트
		setStepStatus: (step: keyof WorkflowState, status: StepStatus) =>
			update(state => ({
				...state,
				workflow: {
					...state.workflow,
					[step]: status
				}
			})),

		resetWorkflow: () =>
			update(state => ({
				...state,
				workflow: {
					step1: 'idle',
					step2: 'idle',
					step3: 'idle'
				},
				outputLogs: []
			})),

		// Workflow 상태 조회
		getWorkflowState: (): WorkflowState => {
			return get({ subscribe }).workflow;
		},

		// 타이머 상태 업데이트
		updateTotalTimer: (timer: TimerState) =>
			update(state => ({ ...state, totalTimer: timer })),

		updateStep1Timer: (timer: TimerState) =>
			update(state => ({ ...state, step1Timer: timer })),

		updateStep2Timer: (timer: TimerState) =>
			update(state => ({ ...state, step2Timer: timer })),

		updateStep3Timer: (timer: TimerState) =>
			update(state => ({ ...state, step3Timer: timer })),

		resetTimers: () =>
			update(state => ({
				...state,
				totalTimer: { ...INITIAL_TIMER },
				step1Timer: { ...INITIAL_TIMER },
				step2Timer: { ...INITIAL_TIMER },
				step3Timer: { ...INITIAL_TIMER }
			})),

		// 출력 로그 추가
		addOutputLog: (log: string) =>
			update(state => ({
				...state,
				outputLogs: [...state.outputLogs, log]
			})),

		clearOutputLogs: () =>
			update(state => ({ ...state, outputLogs: [] })),

		// 고객번호 관리
		setCustomerNumbers: (customerNumbers: string[]) =>
			update(state => ({ ...state, customerNumbers })),

		addCustomerNumber: (customerNumber: string) =>
			update(state => ({
				...state,
				customerNumbers: [...state.customerNumbers, customerNumber]
			})),

		removeCustomerNumber: (index: number) =>
			update(state => ({
				...state,
				customerNumbers: state.customerNumbers.filter((_, i) => i !== index)
			})),

		clearCustomerNumbers: () =>
			update(state => ({ ...state, customerNumbers: [] })),

		// 초기화
		reset: () => set(initialState)
	};
}

export const stubStore = createStubStore();

// ============ Derived Stores ============

/**
 * 현재 사용자가 세션 소유자인지 확인
 */
export const isSessionOwner = derived(
	stubStore,
	$stubStore =>
		$stubStore.sessionStatus.active &&
		$stubStore.sessionStatus.owner === $stubStore.connectionId
);

/**
 * 작업 가능 여부
 * - 세션이 활성화되어 있지 않거나
 * - 현재 사용자가 세션 소유자인 경우
 */
export const canPerformAction = derived(
	[stubStore, isSessionOwner],
	([$stubStore, $isSessionOwner]) =>
		!$stubStore.sessionStatus.active || $isSessionOwner
);

/**
 * Workflow 진행 중 여부
 */
export const isWorkflowRunning = derived(
	stubStore,
	$stubStore =>
		Object.values($stubStore.workflow).some(status => status === 'running')
);
