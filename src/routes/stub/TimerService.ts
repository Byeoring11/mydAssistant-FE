/**
 * Stub Timer Service
 * - Web Worker 기반 타이머 관리
 */

import { Timer } from '$lib/utils/timer/Timer';
import type { TimerState } from './types';
import { stubStore } from './store';

export class StubTimerService {
	private static instance: StubTimerService;

	private totalTimer: Timer | null = null;
	private step1Timer: Timer | null = null;
	private step2Timer: Timer | null = null;
	private step3Timer: Timer | null = null;

	private constructor() {}

	static getInstance(): StubTimerService {
		if (!StubTimerService.instance) {
			StubTimerService.instance = new StubTimerService();
		}
		return StubTimerService.instance;
	}

	/**
	 * 전체 타이머 시작
	 */
	startTotalTimer(): void {
		this.totalTimer = new Timer({
			onTick: (state: TimerState) => {
				stubStore.updateTotalTimer(state);
			}
		});
		this.totalTimer.start();
	}

	/**
	 * Step 1 타이머 시작
	 */
	startStep1Timer(): void {
		this.step1Timer = new Timer({
			onTick: (state: TimerState) => {
				stubStore.updateStep1Timer(state);
			}
		});
		this.step1Timer.start();
	}

	/**
	 * Step 1 타이머 종료
	 */
	stopStep1Timer(): void {
		if (this.step1Timer) {
			this.step1Timer.stop();
		}
	}

	/**
	 * Step 2 타이머 시작
	 */
	startStep2Timer(): void {
		this.step2Timer = new Timer({
			onTick: (state: TimerState) => {
				stubStore.updateStep2Timer(state);
			}
		});
		this.step2Timer.start();
	}

	/**
	 * Step 2 타이머 종료
	 */
	stopStep2Timer(): void {
		if (this.step2Timer) {
			this.step2Timer.stop();
		}
	}

	/**
	 * Step 3 타이머 시작
	 */
	startStep3Timer(): void {
		this.step3Timer = new Timer({
			onTick: (state: TimerState) => {
				stubStore.updateStep3Timer(state);
			}
		});
		this.step3Timer.start();
	}

	/**
	 * Step 3 타이머 종료
	 */
	stopStep3Timer(): void {
		if (this.step3Timer) {
			this.step3Timer.stop();
		}
	}

	/**
	 * 전체 타이머 종료
	 */
	stopTotalTimer(): void {
		if (this.totalTimer) {
			this.totalTimer.stop();
		}
	}

	/**
	 * 모든 타이머 종료 및 초기화
	 */
	terminateAll(): void {
		if (this.totalTimer) {
			this.totalTimer.terminate();
			this.totalTimer = null;
		}
		if (this.step1Timer) {
			this.step1Timer.terminate();
			this.step1Timer = null;
		}
		if (this.step2Timer) {
			this.step2Timer.terminate();
			this.step2Timer = null;
		}
		if (this.step3Timer) {
			this.step3Timer.terminate();
			this.step3Timer = null;
		}
		stubStore.resetTimers();
	}

	/**
	 * 모든 타이머 리셋 (재사용 위해)
	 */
	resetAll(): void {
		this.stopStep1Timer();
		this.stopStep2Timer();
		this.stopStep3Timer();
		this.stopTotalTimer();
		stubStore.resetTimers();
	}
}
