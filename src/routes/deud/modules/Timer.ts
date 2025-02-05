import workerURL from './worker.js?url';
import { timerStore } from '../store/TimerStore';

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
        console.log(this.id);
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
