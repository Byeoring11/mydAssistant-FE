import { writable } from "svelte/store";
import { type TimerState } from "../types/TimerType";
import { Timer } from "../modules/Timer";

export const timerStore = writable<TimerState>({
    'wdexpa1p': { min: '00', sec: '00', msec: '00' },
    'edwap1t': { min: '00', sec: '00', msec: '00' },
    'mypap1d': { min: '00', sec: '00', msec: '00' },
});

export const timerListStore = writable<Record<string, Timer>>({});