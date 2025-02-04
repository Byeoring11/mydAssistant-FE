import { writable } from 'svelte/store';

export const notification = writable({
    type: 'info', // 'info', 'success', 'warning', 'error' 중 하나
    message: '',
    visible: false,
});

export const showNotification = (type: 'info'|'success'|'warning'|'error', message: string) => {
    notification.set({ type, message, visible: true });
    setTimeout(() => {
        notification.set({ type: 'info', message: '', visible: false });
    }, 5000); // 5초 후에 사라짐
}