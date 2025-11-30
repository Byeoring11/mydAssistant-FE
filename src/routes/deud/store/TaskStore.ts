import { writable } from 'svelte/store';
import { type TaskType } from '../types/TaskType';

export const taskStore = writable<TaskType>({
    taskState        : true,
    runningState     : false,
    loadingState     : [1, 1, 1],
    currentServerType: null,
    currentTaskResolver: null,
    isUnderMaintain  : true
});