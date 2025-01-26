export const delay = (ms: number, signal?: AbortSignal): Promise<void> => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, ms);

        // 중단 신호 감지
        signal?.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new Error('Delay aborted'));
        });
    });
};

