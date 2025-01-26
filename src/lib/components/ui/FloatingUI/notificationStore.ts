import { writable } from 'svelte/store';

export const notification = writable({
    message: '',
    visible: false
});

export const showNotification = (message: string) => {
    notification.set({ message, visible: true });
    setTimeout(() => {
        notification.set({ message: '', visible: false });
    }, 5000); // 5초 후에 사라짐
}