/**
 * 고객번호 입력 관리 컴포저블
 * - 입력 검증 및 태그 관리
 */

import { CusnoValidator } from '../CusnoValidator';
import { showNotification } from '$lib/components/ui/FloatingUI/notificationStore';

type ValidationState = 'idle' | 'valid' | 'invalid' | 'partial';

export function useCustomerNumberInput() {
	let inputValue = $state('');
	let customerNumbers = $state<string[]>([]);
	let validationState = $state<ValidationState>('idle');

	/**
	 * 입력값 실시간 검증
	 */
	function validateInput(): void {
		const trimmed = inputValue.trim();

		// 여러 개 입력 감지 (복붙) → 즉시 추가
		if (/[\s,\n\r]+/.test(trimmed)) {
			addNumbers();
			return;
		}

		if (!trimmed) {
			validationState = 'idle';
			return;
		}

		// 숫자 아니면 invalid
		if (!/^\d+$/.test(trimmed)) {
			validationState = 'invalid';
			return;
		}

		// 유효한 길이면 valid
		if (CusnoValidator.isValid(trimmed)) {
			validationState = 'valid';
		}
		// 입력 중이면 partial
		else if (trimmed.length < 9) {
			validationState = 'partial';
		}
		// 그 외는 invalid
		else {
			validationState = 'invalid';
		}
	}

	/**
	 * 고객번호 추가
	 */
	function addNumbers(): void {
		const validNumbers = CusnoValidator.extractValidCusno(inputValue);
		const invalidNumbers = CusnoValidator.extractInvalidCusno(inputValue);

		// 유효한 번호 추가 (중복 제거)
		if (validNumbers.length > 0) {
			customerNumbers = [...new Set([...customerNumbers, ...validNumbers])];
		}

		// 무효한 번호 알림
		if (invalidNumbers.length > 0) {
			showNotification(
				'warning',
				`올바르지 않은 형식의 고객번호 ${invalidNumbers.length}개 제외 <br/> ${invalidNumbers.join(', ')}`
			);
		}

		// 초기화
		inputValue = '';
		validationState = 'idle';
	}

	/**
	 * 고객번호 제거
	 */
	function removeNumber(index: number): void {
		customerNumbers = customerNumbers.filter((_, i) => i !== index);
	}

	/**
	 * 마지막 고객번호 제거 (Backspace)
	 */
	function removeLast(): void {
		if (!inputValue && customerNumbers.length > 0) {
			customerNumbers = customerNumbers.slice(0, -1);
		}
	}

	/**
	 * 모든 고객번호 초기화
	 */
	function clear(): void {
		inputValue = '';
		customerNumbers = [];
		validationState = 'idle';
	}

	/**
	 * 키보드 이벤트 핸들러
	 */
	function handleKeyDown(e: KeyboardEvent): void {
		// Enter, Space, Comma → 추가
		if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
			e.preventDefault();
			if (inputValue.trim()) {
				addNumbers();
			}
		}
		// Backspace → 마지막 제거
		else if (e.key === 'Backspace') {
			removeLast();
		}
	}

	return {
		// State
		get inputValue() {
			return inputValue;
		},
		set inputValue(value: string) {
			inputValue = value;
		},
		get customerNumbers() {
			return customerNumbers;
		},
		get validationState() {
			return validationState;
		},
		get hasNumbers() {
			return customerNumbers.length > 0;
		},

		// Actions
		validateInput,
		addNumbers,
		removeNumber,
		clear,
		handleKeyDown
	};
}
