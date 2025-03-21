import { get } from 'svelte/store';
import { WebSocketService } from '../services/WebSocketService';
import { TimerService } from '../services/TimerService';
import { taskStore } from '../store/TaskStore';
import { showNotification } from '$lib/components/ui/FloatingUI/notificationStore';
import type { WebSocketMessage } from '../types/WebSocketType';
import { Server } from '$lib/constants/server';
import { DeudWSTaskError } from '../errors/DeudErrors';

export class TaskManager {
	private webSocketService: WebSocketService;
	private timerService: TimerService;
	private abortController: AbortController;

	constructor() {
		this.webSocketService = WebSocketService.getInstance();
		this.timerService = new TimerService();
		this.abortController = new AbortController();
		this.setupWebSocketHandlers();
	}

	private setupWebSocketHandlers(): void {
		this.webSocketService.onMessage((msg) => {
			const $taskStore = get(taskStore);
			console.log(msg);

			switch (msg.type) {
				case 'task_state_update':
					taskStore.update((state) => ({ ...state, taskState: msg.state as boolean }));
					break;
				case 'task_start':
					console.log('task_start 메시지 수신')
					this.handleTaskStart(msg);
					break;
				case 'task_complete':
					if ($taskStore.currentServerType === msg.serverType && $taskStore.currentTaskResolver) {
						this.handleTaskComplete(msg);
						$taskStore.currentTaskResolver.resolve();
						this.cleanupTask();
					}
					break;
				case 'task_cancelled':
					if ($taskStore.currentTaskResolver) {
						this.handleTaskCancelled(msg);
						$taskStore.currentTaskResolver.reject(new DOMException('Task cancelled', 'AbortError'));
						this.cleanupTask();
					}
					break;
				case 'task_error':
					if ($taskStore.currentServerType === msg.serverType && $taskStore.currentTaskResolver) {
						this.handleTaskError(msg);
						$taskStore.currentTaskResolver.reject(new DeudWSTaskError(msg.message as string));
						this.cleanupTask();
					}
					break;
				case 'task_log':
					console.log(`Task log from server ${msg.serverType}: ${msg.value}`);
					break;
			}
		});
	}

	public getAbortController(): AbortController {
		return this.abortController;
	}

	private handleTaskStart(msg: WebSocketMessage): void {
		taskStore.update((state) => {
			const newLoadingState = [...state.loadingState];
			newLoadingState[(msg.serverType as number) - 1] = 2;
			return { ...state, loadingState: newLoadingState };
		});

		const serverName = this.getServerName(msg.serverType as number);
		this.timerService.startTimer(serverName);
	}

	private handleTaskComplete(msg: WebSocketMessage): void {
		taskStore.update((state) => {
			const newLoadingState = [...state.loadingState];
			newLoadingState[(msg.serverType as number) - 1] = 3;
			return {
				...state,
				loadingState: newLoadingState
			};
		});

		const serverName = this.getServerName(msg.serverType as number);
		this.timerService.stopTimer(serverName);
	}

	private handleTaskCancelled(msg: WebSocketMessage): void {
		taskStore.update((state) => {
			const newLoadingState = [...state.loadingState];
			newLoadingState[(msg.serverType as number) - 1] = 9;
			return {
				...state,
				loadingState: newLoadingState
			};
		});

		const serverName = this.getServerName(msg.serverType as number);
		this.timerService.stopTimer(serverName);
	}

	private handleTaskError(msg: WebSocketMessage): void {
		taskStore.update((state) => {
			const newLoadingState = [...state.loadingState];
			newLoadingState[(msg.serverType as number) - 1] = 9;
			return {
				...state,
				loadingState: newLoadingState
			};
		});

		const serverName = this.getServerName(msg.serverType as number);
		this.timerService.stopTimer(serverName);
	}

	private getServerName(serverType: number): string {
		return Server[serverType];
	}

	private cleanupTask(): void {
		taskStore.update((state) => ({ ...state, currentServerType: null, currentTaskResolver: null }));
	}

	public async launchDeud(cusnoList: string[]): Promise<void> {
		if (!get(taskStore).taskState) {
			showNotification('error', '다른 사용자가 대응답 적재 중입니다');
			return;
		}

		if (get(taskStore).runningState) {
			showNotification('error', '이미 대응답 프로세스 진행 중입니다');
			return;
		}

		if (cusnoList.length === 0) {
			showNotification('error', '고객번호를 입력해주세요');
			return;
		}

		try {
			taskStore.update((state) => ({ ...state, runningState: true, loadingState: [1, 1, 1] }));

			this.timerService.resetAllTimers();
			console.log(cusnoList);
			await this.executeTask(1, cusnoList);
			await this.executeTask(2, cusnoList);
			await this.executeTask(3, cusnoList);
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				showNotification('warning', `대응답 프로세스가 중단되었습니다.`);
			}

			if (error instanceof DeudWSTaskError) {
				showNotification('error', `대응답 적재 중 에러가 발생했습니다. <br/> ${error.message}`);
			}
		} finally {
			taskStore.update((state) => ({ ...state, runningState: false }));
			console.log(get(taskStore));
		}
	}

	private async executeTask(serverType: number, cusnoList: string[]): Promise<void> {
		return new Promise((resolve, reject) => {
			taskStore.update((state) => ({
				...state,
				currentServerType: serverType,
				currentTaskResolver: { resolve, reject }
			}));
			console.log(get(taskStore));
			this.webSocketService.send({
				action: 'start_task',
				serverType,
				cusnoList
			});
		});
	}

	public async cancelOngoingTask(): Promise<void> {
		const $taskStore = get(taskStore);

		if ($taskStore.currentServerType !== null) {
			this.webSocketService.send({
				action: 'task_cancel',
				serverType: $taskStore.currentServerType,
				cusnoList: null
			});
		}
	}

	public async initTaskStore(): Promise<void> {
		this.timerService.terminateAllTimers();
		taskStore.update((state) => ({
			 ...state,
			 runningState: false,
			 loadingState: [1, 1, 1],
			 currentServerType: null,
			 currentTaskResolver: null,
		}));
	}
}
