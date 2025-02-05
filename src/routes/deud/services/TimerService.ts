import { Timer } from "../modules/Timer";
import { timerListStore } from "../store/TimerStore";
import { get } from "svelte/store";

export class TimerService {
    constructor() {
      this.initTimers();
    }
  
    private initTimers(): void {
      	const timer1 = new Timer('wdexpa1p');
      	const timer2 = new Timer('edwap1t');
      	const timer3 = new Timer('mypap1d');
        
      	timerListStore.set({
      		'wdexpa1p': timer1,
      		'edwap1t': timer2,
      		'mypap1d': timer3,
      	});
    }
  
    public startTimer(id: string): void {
      get(timerListStore)[id].start();
    }

    public stopTimer(id: string): void {
      get(timerListStore)[id].stop();
    }
    
    public resetAllTimers(): void {
      Object.values(get(timerListStore)).forEach(timer => timer.reset());
    }
  
    public terminateAllTimers(): void {
      Object.values(get(timerListStore)).forEach(timer => timer.terminate());
    }
  }