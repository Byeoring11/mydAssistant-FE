/**
 * Stub WebSocket Service
 * - WebSocket 연결 및 메시지 처리
 */

import { get } from 'svelte/store';
import { stubStore } from './store';
import type { ServerHealth, SessionStatus } from './types';
import { showNotification } from '$lib/components/ui/FloatingUI/notificationStore';
import { StubTimerService } from './TimerService';
import { createLoadHistory } from '$lib/api/stubApi';
import type { LoadHistoryCreateRequest } from '$lib/api/stubApi';

export class StubWebSocketService {
	private static instance: StubWebSocketService;
	private ws: WebSocket | null = null;
	private wsUrl: string | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 3000;
	private reconnectTimeout: number | null = null;
	private timerService = StubTimerService.getInstance();
	private workflowStartTime: Date | null = null;
	private currentBatchId: string | null = null;

	private constructor() {}

	static getInstance(): StubWebSocketService {
		if (!StubWebSocketService.instance) {
			StubWebSocketService.instance = new StubWebSocketService();
		}
		return StubWebSocketService.instance;
	}

	/**
	 * WebSocket 연결
	 */
	async connect(url: string): Promise<void> {
		// 기존 재연결 타임아웃 취소
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}

		// 이미 연결되어 있으면 종료
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			console.log('[STUB-WS] Already connected');
			return;
		}

		// 기존 WebSocket이 있으면 정리
		if (this.ws) {
			this.ws.onclose = null; // 재연결 방지
			this.ws.close();
			this.ws = null;
		}

		// URL 저장 (재연결 시 사용)
		this.wsUrl = url;

		try {
			console.log('[STUB-WS] Connecting to:', url);
			this.ws = new WebSocket(url);

			this.ws.onopen = () => {
				console.log('[STUB-WS] Connected successfully');
				this.reconnectAttempts = 0;
				stubStore.setConnected(true, null); // Welcome 메시지에서 connection_id 업데이트
			};

			this.ws.onmessage = (event) => {
				try {
					this.handleMessage(JSON.parse(event.data));
				} catch (err) {
					console.error('[STUB-WS] Failed to parse message:', err);
				}
			};

			this.ws.onerror = (error) => {
				console.error('[STUB-WS] Error:', error);
				showNotification('error', 'WebSocket 연결 오류가 발생했습니다.');
			};

			this.ws.onclose = (event) => {
				console.log('[STUB-WS] Disconnected:', event.code, event.reason);
				stubStore.setConnected(false, null);

				// 진행 중인 작업이 있었다면 타이머 중지 및 상태 초기화
				const currentWorkflow = stubStore.getWorkflowState();
				const isRunning = Object.values(currentWorkflow).some(status => status === 'running');
				if (isRunning) {
					this.timerService.terminateAll();
					stubStore.resetWorkflow();
					stubStore.resetTimers();
					stubStore.addOutputLog('[INFO] WebSocket 연결이 끊어져 작업이 중단되었습니다.\n');
				}

				// 정상 종료(코드 1000)가 아니면 재연결 시도
				if (event.code !== 1000) {
					this.attemptReconnect();
				}
			};
		} catch (error) {
			console.error('[STUB-WS] Connection error:', error);
			showNotification('error', `WebSocket 연결 실패: ${error}`);
			throw error;
		}
	}

	/**
	 * 재연결 시도
	 */
	private attemptReconnect(): void {
		if (!this.wsUrl) {
			console.error('[STUB-WS] Cannot reconnect: No URL stored');
			return;
		}

		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			console.log(`[STUB-WS] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

			showNotification('info', `재연결 시도 중... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

			this.reconnectTimeout = setTimeout(() => {
				this.connect(this.wsUrl!);
			}, this.reconnectDelay);
		} else {
			console.error('[STUB-WS] Max reconnection attempts reached');
			showNotification('error', 'WebSocket 재연결에 실패했습니다. 페이지를 새로고침해주세요.');
		}
	}

	/**
	 * 메시지 전송
	 */
	send(data: any): void {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(data));
		} else {
			console.error('[STUB-WS] Cannot send message: WebSocket not connected');
			showNotification('error', 'WebSocket이 연결되지 않았습니다.');
		}
	}

	/**
	 * 메시지 처리
	 */
	private handleMessage(message: any): void {
		console.log('[STUB-WS] Received:', message);

		switch (message.type) {
			case 'welcome':
				this.handleWelcome(message);
				break;

			case 'session_started':
			case 'session_ended':
			case 'session_status':
				this.handleSessionStatus(message);
				break;

			case 'server_health':
				this.handleServerHealth(message);
				break;

			case 'output':
				this.handleOutput(message);
				break;

			case 'status':
				this.handleStatus(message);
				break;

			case 'complete':
				this.handleComplete(message);
				break;

			case 'error':
				this.handleError(message);
				break;

			default:
				console.warn('[STUB-WS] Unknown message type:', message.type);
		}
	}

	/**
	 * Welcome 메시지 처리
	 */
	private handleWelcome(message: any): void {
		stubStore.setConnected(true, message.connection_id);

		// 초기 세션 상태
		stubStore.setSessionStatus({
			active: message.session_active ?? false,
			owner: message.session_owner ?? null
		});

		// 초기 서버 Health 상태
		if (message.server_health) {
			stubStore.setAllServerHealth(message.server_health);
		}

		showNotification('success', 'WebSocket 연결 성공!');
	}

	/**
	 * 세션 상태 처리
	 */
	private handleSessionStatus(message: any): void {
		const sessionStatus: SessionStatus = {
			active: message.session_active ?? false,
			owner: message.session_owner ?? null
		};

		console.log('[STUB-WS] Session status update:', sessionStatus);
		stubStore.setSessionStatus(sessionStatus);

		// if (message.message) {
		// 	stubStore.addOutputLog(`[SESSION] ${message.message}`);
		// }
	}

	/**
	 * 서버 Health 상태 처리
	 */
	private handleServerHealth(message: any): void {
		const serverName = message.server_name;
		const health: ServerHealth = message.status;

		stubStore.updateServerHealth(serverName, health);

		const statusText = message.is_healthy ? '정상' : '다운';
		showNotification(message.is_healthy ? 'info' : 'warning', `서버 ${serverName} 상태: ${statusText}`);
	}

	/**
	 * 출력 메시지 처리
	 */
	private handleOutput(message: any): void {
		if (message.data) {
			stubStore.addOutputLog(message.data);
		}
	}

	/**
	 * 상태 메시지 처리
	 */
	private handleStatus(message: any): void {
		if (message.message) {
			stubStore.addOutputLog(`[STATUS] ${message.message}`);
		}
	}

	/**
	 * 완료 메시지 처리
	 */
	private handleComplete(message: any): void {
		if (message.message) {
			stubStore.addOutputLog(`[COMPLETE] ${message.message}`);
		}

		// Step 상태를 성공으로 업데이트하고 자동으로 다음 단계 실행
		const currentWorkflow = stubStore.getWorkflowState();

		if (currentWorkflow.step1 === 'running') {
			// Step 1 타이머 중지
			this.timerService.stopStep1Timer();
			stubStore.setStepStatus('step1', 'success');
			stubStore.addOutputLog('[INFO] Step 1 완료 - SCP 파일 전송 시작...\n');
			// Step 2 타이머 시작 및 자동 실행
			this.timerService.startStep2Timer();
			this.scpTransfer();
		} else if (currentWorkflow.step2 === 'running') {
			// Step 2 타이머 중지
			this.timerService.stopStep2Timer();
			stubStore.setStepStatus('step2', 'success');
			stubStore.addOutputLog('[INFO] Step 2 완료 - mypap1d 서버 작업 시작...\n');
			// Step 3 타이머 시작 및 자동 실행
			this.timerService.startStep3Timer();
			this.executeStep3();
		} else if (currentWorkflow.step3 === 'running') {
			// Step 3 및 전체 타이머 중지
			this.timerService.stopStep3Timer();
			this.timerService.stopTotalTimer();
			stubStore.setStepStatus('step3', 'success');

			// 작업 이력 기록
			this.recordWorkflowHistory();

			// 세션 종료
			this.endSession();
			showNotification('success', '모든 작업이 완료되었습니다!');
		}
	}

	/**
	 * 에러 메시지 처리
	 */
	private handleError(message: any): void {
		const errorMsg = message.detail || message.message || 'Unknown error';
		stubStore.addOutputLog(`[ERROR] ${errorMsg}`);

		// Step 상태를 에러로 업데이트하고 타이머 중지
		const currentWorkflow = stubStore.getWorkflowState();
		if (currentWorkflow.step1 === 'running') {
			this.timerService.stopStep1Timer();
			this.timerService.stopTotalTimer();
			stubStore.setStepStatus('step1', 'error');
		} else if (currentWorkflow.step2 === 'running') {
			this.timerService.stopStep2Timer();
			this.timerService.stopTotalTimer();
			stubStore.setStepStatus('step2', 'error');
		} else if (currentWorkflow.step3 === 'running') {
			this.timerService.stopStep3Timer();
			this.timerService.stopTotalTimer();
			stubStore.setStepStatus('step3', 'error');
		}

		showNotification('error', errorMsg);
	}

	/**
	 * 연결 종료
	 */
	close(): void {
		// 재연결 타임아웃 취소
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}

		// 재연결 시도 초기화
		this.reconnectAttempts = this.maxReconnectAttempts;

		if (this.ws) {
			this.ws.onclose = null; // 재연결 방지
			this.ws.close(1000, 'Client closed connection');
			this.ws = null;
		}

		this.wsUrl = null;
		stubStore.setConnected(false, null);
	}

	// ============ Action Methods ============

	/**
	 * 전체 워크플로우 시작
	 */
	startWorkflow(customerNumbers: string[]): void {
		// 고객번호를 쉼표로 연결
		const customerNumberString = customerNumbers.join(',');

		// 작업 시작 시간 기록 및 배치 ID 생성
		this.workflowStartTime = new Date();
		this.currentBatchId = crypto.randomUUID();

		// 세션 시작
		this.send({
			type: 'start_session'
		});
		stubStore.addOutputLog('[INFO] 작업 시작 - 세션 점유...\n');

		// 전체 타이머 및 Step 1 타이머 시작
		this.timerService.startTotalTimer();
		this.timerService.startStep1Timer();

		// Step 1 시작: mdwap1p에서 DAT 파일 생성
		const step1Command = `/opt/scripts/vmyp_postgresql_dat_ddts.sh ${customerNumberString}`;
		this.send({
			type: 'ssh_command',
			server: 'mdwap1p',
			command: step1Command,
			throttle_interval: 0.1
		});
		stubStore.setStepStatus('step1', 'running');
		stubStore.addOutputLog(`[STEP 1] mdwap1p 서버 - DAT 파일 생성 시작\n`);
		stubStore.addOutputLog(`[CMD] ${step1Command}\n`);
	}

	/**
	 * Step 3 실행: mypap1d에서 DAT 파일 적재
	 */
	private executeStep3(): void {
		const step3Command = `/opt/scripts/bmyp_postgresql_dat_odst.sh`;

		this.send({
			type: 'ssh_command',
			server: 'mypap1d',
			command: step3Command,
			throttle_interval: 0.1
		});
		stubStore.setStepStatus('step3', 'running');
		stubStore.addOutputLog(`[STEP 3] mypap1d 서버 - DAT 파일 적재 시작\n`);
		stubStore.addOutputLog(`[CMD] ${step3Command}\n`);
	}

	/**
	 * 세션 종료
	 */
	endSession(): void {
		this.send({
			type: 'end_session'
		});
		stubStore.addOutputLog('[INFO] 세션 종료\n');
	}

	/**
	 * SCP 파일 전송
	 */
	private scpTransfer(transferName: string = 'stub_data_transfer'): void {
		this.send({
			type: 'scp_transfer',
			transfer_name: transferName
		});
		stubStore.setStepStatus('step2', 'running');
		stubStore.addOutputLog(`[STEP 2] SCP 파일 전송 - mdwap1p → mypap1d\n`);
	}

	/**
	 * 작업 이력 기록
	 */
	private async recordWorkflowHistory(): Promise<void> {
		try {
			// 작업 완료 시간
			const completedAt = new Date();

			// 작업 소요 시간 계산 (초 단위)
			const executionTimeSeconds = this.workflowStartTime
				? (completedAt.getTime() - this.workflowStartTime.getTime()) / 1000
				: 0;

			// 현재 스토어에서 고객번호 목록 가져오기
			const state = get(stubStore);
			const customerNumbers = state.customerNumbers;
			const connectionId = state.connectionId;

			// 유효성 검사
			if (!this.currentBatchId || !this.workflowStartTime || customerNumbers.length === 0) {
				console.warn('[STUB-WS] Cannot record history: missing required data');
				return;
			}

			// API 요청 데이터 생성
			const historyData: LoadHistoryCreateRequest = {
				batch_id: this.currentBatchId,
				customer_numbers: customerNumbers,
				client_ip: 'unknown', // 백엔드에서 request.client.host로 실제 IP 추출
				connection_id: connectionId ?? undefined,
				execution_time_seconds: executionTimeSeconds,
				started_at: this.workflowStartTime.toISOString(),
				completed_at: completedAt.toISOString()
			};

			// API 호출
			const response = await createLoadHistory(historyData);
			console.log('[STUB-WS] History recorded:', response);
			stubStore.addOutputLog(`[INFO] 작업 이력 저장 완료 (${response.inserted_count}건)\n`);
		} catch (error) {
			console.error('[STUB-WS] Failed to record history:', error);
			stubStore.addOutputLog(`[WARNING] 작업 이력 저장 실패: ${error}\n`);
			// 이력 저장 실패는 워크플로우 성공 자체에 영향을 주지 않음
		}
	}
}
