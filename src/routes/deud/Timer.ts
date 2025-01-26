import { writable } from 'svelte/store';
import workerURL from './worker.js?url';

interface TimerState {
    [key: string]: { min: string; sec: string; msec: string; }
};

export const timerStore = writable<TimerState>({
    'wdexpa1p': { min: '00', sec: '00', msec: '00' },
    'edwap1t': { min: '00', sec: '00', msec: '00' },
    'mypap1d': { min: '00', sec: '00', msec: '00' },
});

export const timerListStore = writable<Record<string, Timer>>({});

export class Timer {
    private worker: Worker;
    private id: string;

    constructor(id: string) {
        this.worker = new Worker(workerURL);
        this.id = id;
    }

    padZero(num: number): string {
        return num.toString().padStart(2, '0');
    }

    start() {
        this.worker.postMessage('start');
        this.worker.onmessage = (event) => {
            const { min, sec, msec } = event.data;
            timerStore.update((state) => {
                state[this.id] = {
                    min: this.padZero(min),
                    sec: this.padZero(sec),
                    msec: this.padZero(msec),
                };
                return state;
            });
        };
    }
    
    stop() {
        this.worker.postMessage('stop');
    }

    reset() {
        this.stop();
        timerStore.update((state) => {
            state[this.id] = { min: '00', sec: '00', msec: '00' };
            return state;
        });
    }

    terminate() {
        this.worker.terminate();
        timerStore.update((state) => {
            state[this.id] = { min: '00', sec: '00', msec: '00' };
            return state;
        });
    }
};
