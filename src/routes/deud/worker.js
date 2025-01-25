let min = 0;
let sec = 0;
let msec = 0;
let intervalId = 0;

onmessage = function (e) {
    if (e.data === 'start') {
        intervalId = this.setInterval(() => {
            msec += 1;
            if (msec === 100) {
                msec = 0;
                sec++;
            }
            if (sec === 60) {
                sec = 0;
                min++;
            }
            const result = {min, sec, msec};
            this.postMessage(result);
        }, 10);
    }

    if (e.data === 'stop') {
        this.clearInterval(intervalId);
    }
};