/**
 * Stub Load 모듈 상수 정의
 */

import type { StepStatus } from '../types';

/**
 * Step 아이콘
 */
export const getStepIcon = (status: StepStatus): string => {
	switch (status) {
		case 'success':
			return '✓';
		case 'error':
			return '✗';
		case 'running':
			return '●';
		case 'idle':
		default:
			return '○';
	}
};

/**
 * Step 색상
 */
export const getStepColor = (status: StepStatus): string => {
	switch (status) {
		case 'success':
			return '#10B981';
		case 'error':
			return '#EF4444';
		case 'running':
			return '#3B82F6';
		case 'idle':
		default:
			return 'rgba(255, 255, 255, 0.3)';
	}
};

/**
 * Workflow Step 정보
 */
export const WORKFLOW_STEPS = [
	{
		key: 'step1' as const,
		title: 'Step 1. DAT 파일 생성',
		description: 'mdwap1t_p 서버에서 DW 데이터 추출'
	},
	{
		key: 'step2' as const,
		title: 'Step 2. SCP 파일 전송',
		description: 'mdwap1t_p → mypap1d 파일 전송'
	},
	{
		key: 'step3' as const,
		title: 'Step 3. DAT 파일 적재',
		description: 'mypap1d 서버의 Tibero와 PostgreSQL DB 적재'
	}
] as const;
