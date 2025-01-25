import workerURL from './worker.js?url';

class Timer {
    private min: number;
    private sec: number;
    private msec: number;
    private worker: Worker;

    constructor() {
        this.min = 0;
        this.sec = 0;
        this.msec = 0;
        this.worker = new Worker(workerURL);
    }

    start() {
        this.worker.postMessage('start');
        this.worker.onmessage = (event) => {
            const { min, sec, msec } = event.data;
            this.min = min;
            this.sec = sec;
            this.msec = msec;
            this.render()
        };
    }

    stop() {
        this.worker.postMessage('stop');
    }

    render() {
        // return `${this.min}:${this.sec}:${this.msec}`;
    }
}

export default Timer;