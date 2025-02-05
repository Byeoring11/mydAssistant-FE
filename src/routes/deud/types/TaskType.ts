export interface TaskType {
    taskState        : boolean,
    runningState     : boolean,
    loadingState     : number[],
    currentServerType: number | null,
    currentTaskResolver: {
        resolve: () => void;
        reject: (error: Error) => void;
    } | null;
}