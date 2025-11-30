import workerURL from './worker.js?url';

export interface TimerState {
  min: string;
  sec: string;
  msec: string;
}

export interface TimerOptions {
  onTick?: (state: TimerState) => void;
  onReset?: (state: TimerState) => void;
  onTerminate?: (state: TimerState) => void;
}

const INITIAL_STATE: TimerState = { min: '00', sec: '00', msec: '00' };

export class Timer {
  private worker: Worker;
  private options: TimerOptions;

  constructor(options: TimerOptions = {}) {
    this.worker = new Worker(workerURL);
    this.options = options;
  }

  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  private formatState(min: number, sec: number, msec: number): TimerState {
    return {
      min: this.padZero(min),
      sec: this.padZero(sec),
      msec: this.padZero(msec),
    };
  }

  start(): void {
    this.worker.postMessage('start');
    this.worker.onmessage = (event) => {
      const { min, sec, msec } = event.data;
      this.options.onTick?.(this.formatState(min, sec, msec));
    };
  }

  stop(): void {
    this.worker.postMessage('stop');
  }

  reset(): void {
    this.stop();
    this.options.onReset?.(INITIAL_STATE);
  }

  terminate(): void {
    this.worker.terminate();
    this.options.onTerminate?.(INITIAL_STATE);
  }

  // 런타임에 콜백 변경이 필요한 경우
  updateOptions(options: Partial<TimerOptions>): void {
    this.options = { ...this.options, ...options };
  }
}