import { writable } from 'svelte/store';

export interface ConfirmOptions {
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	type?: 'info' | 'warning' | 'danger';
}

interface ConfirmState extends ConfirmOptions {
	visible: boolean;
	resolve?: (value: boolean) => void;
}

const initialState: ConfirmState = {
	visible: false,
	message: '',
	title: '확인',
	confirmText: '확인',
	cancelText: '취소',
	type: 'info'
};

export const confirmState = writable<ConfirmState>(initialState);

/**
 * 커스텀 confirm 다이얼로그 표시
 * @param options - 확인 대화상자 옵션
 * @returns Promise<boolean> - 사용자가 확인을 눌렀으면 true, 취소를 눌렀으면 false
 */
export function showConfirm(options: string | ConfirmOptions): Promise<boolean> {
	return new Promise((resolve) => {
		const config: ConfirmOptions = typeof options === 'string' ? { message: options } : options;

		confirmState.set({
			visible    : true,
			title      : config.title || '확인',
			message    : config.message,
			confirmText: config.confirmText || '확인',
			cancelText : config.cancelText || '취소',
			type       : config.type || 'info',
			resolve
		});
	});
}

export function closeConfirm(result: boolean) {
	confirmState.update((state) => {
		if (state.resolve) {
			state.resolve(result);
		}
		return { ...initialState };
	});
}
