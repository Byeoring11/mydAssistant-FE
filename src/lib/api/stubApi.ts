/**
 * Stub Load History API Client
 * 작업 이력 적재 및 조회 API (리팩토링 버전)
 */

import { post, get, del, patch } from './apiClient';

/** 작업 이력 생성 요청 */
export interface LoadHistoryCreateRequest {
	batch_id: string;
	customer_numbers: string[];
	client_ip: string;
	connection_id?: string;
	execution_time_seconds: number;
	started_at: string; // ISO 8601 format
	completed_at: string; // ISO 8601 format
}

/** 작업 이력 생성 응답 */
export interface LoadHistoryCreateResponse {
	success: boolean;
	message: string;
	batch_id: string;
	inserted_count: number;
}

/** 작업 이력 단건 응답 */
export interface LoadHistoryResponse {
	id: number;
	batch_id: string;
	customer_number: string;
	client_ip: string;
	connection_id: string | null;
	execution_time_seconds: number;
	started_at: string;
	completed_at: string;
	created_at: string;
	updated_at: string | null;
	note: string | null;
}

/** 작업 이력 목록 응답 */
export interface LoadHistoryListResponse {
	total: number;
	items: LoadHistoryResponse[];
}

/** 배치 작업 요약 */
export interface BatchSummaryResponse {
	batch_id: string;
	total_customers: number;
	client_ip: string;
	execution_time_seconds: number;
	started_at: string;
	completed_at: string;
	created_at: string;
}

/** 작업 이력 메모 업데이트 요청 */
export interface LoadHistoryNoteUpdateRequest {
	note: string;
}

/** 작업 이력 메모 업데이트 응답 */
export interface LoadHistoryNoteUpdateResponse {
	success: boolean;
	message: string;
	history_id: number;
}

/** 작업 이력 정리 응답 */
export interface LoadHistoryDeleteResponse {
	success: boolean;
	message: string;
	deleted_count: number;
	retention_days: number;
}

/**
 * 작업 이력 생성
 *
 * 고객번호 단위로 여러 row 적재
 * 10개 고객번호 입력 시 → 10개 레코드 생성
 */
export async function createLoadHistory(
	data: LoadHistoryCreateRequest
): Promise<LoadHistoryCreateResponse> {
	return post<LoadHistoryCreateResponse>('/api/v1/stub/histories', data);
}

/**
 * 작업 이력 목록 조회
 *
 * 필터 없이 조회 시: 최근 100건 반환
 * 고객번호, IP, Note로 필터링 가능
 */
export async function getLoadHistories(params?: {
	customer_number?: string;
	client_ip?: string;
	note?: string;
	limit?: number;
	offset?: number;
}): Promise<LoadHistoryListResponse> {
	const queryString = params
		? '?' +
		  new URLSearchParams(
				Object.entries(params)
					.filter(([_, value]) => value !== undefined)
					.map(([key, value]) => [key, String(value)])
		  ).toString()
		: '';

	return get<LoadHistoryListResponse>(`/api/v1/stub/histories${queryString}`);
}

/**
 * 단일 작업 이력 조회
 *
 * ID로 특정 이력 조회
 */
export async function getLoadHistoryById(historyId: number): Promise<LoadHistoryResponse> {
	return get<LoadHistoryResponse>(`/api/v1/stub/histories/${historyId}`);
}

/**
 * 작업 이력 메모 업데이트
 *
 * 특정 이력에 메모/설명 추가 또는 수정
 */
export async function updateLoadHistoryNote(
	historyId: number,
	request: LoadHistoryNoteUpdateRequest
): Promise<LoadHistoryNoteUpdateResponse> {
	return patch<LoadHistoryNoteUpdateResponse>(
		`/api/v1/stub/histories/${historyId}/note`,
		request
	);
}

/**
 * 배치 작업 요약 조회
 *
 * 배치 ID로 전체 작업 요약 정보 반환
 * 총 고객번호 수, 실행 시간 등
 */
export async function getBatchSummary(batchId: string): Promise<BatchSummaryResponse> {
	return get<BatchSummaryResponse>(`/api/v1/stub/batches/${batchId}`);
}

/**
 * 특정 고객번호의 작업 이력 조회
 *
 * 해당 고객번호가 포함된 모든 작업 이력 반환
 * 최근순으로 정렬
 */
export async function getCustomerHistories(
	customerNumber: string,
	limit: number = 10
): Promise<LoadHistoryResponse[]> {
	const queryString = `?limit=${limit}`;
	return get<LoadHistoryResponse[]>(
		`/api/v1/stub/customers/${customerNumber}/histories${queryString}`
	);
}

/**
 * 오래된 작업 이력 삭제
 *
 * 지정한 일수보다 오래된 레코드 삭제
 * 기본값: 90일
 */
export async function deleteOldHistories(days: number = 90): Promise<LoadHistoryDeleteResponse> {
	const queryString = `?days=${days}`;
	return del<LoadHistoryDeleteResponse>(`/api/v1/stub/histories${queryString}`);
}
