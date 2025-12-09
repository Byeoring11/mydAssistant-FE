/**
 * Patch Note API Client
 * 패치 노트 조회 및 관리 API
 */

import { post, get, del, patch } from './apiClient';

/** 패치 노트 생성 요청 */
export interface PatchNoteCreateRequest {
	title: string;
	content: string;
	patch_date: string; // YYYY-MM-DD format
}

/** 패치 노트 수정 요청 */
export interface PatchNoteUpdateRequest {
	title?: string;
	content?: string;
	patch_date?: string; // YYYY-MM-DD format
}

/** 패치 노트 응답 */
export interface PatchNoteResponse {
	id: number;
	title: string;
	content: string;
	patch_date: string; // YYYY-MM-DD
	created_at: string; // ISO 8601 format
	updated_at: string | null; // ISO 8601 format
}

/** 패치 노트 목록 응답 */
export interface PatchNoteListResponse {
	total: number;
	items: PatchNoteResponse[];
}

/** 패치 노트 생성 응답 */
export interface PatchNoteCreateResponse {
	success: boolean;
	message: string;
	patch_note_id: number;
}

/** 패치 노트 삭제 응답 */
export interface PatchNoteDeleteResponse {
	success: boolean;
	message: string;
	patch_note_id: number;
}

/**
 * 패치 노트 생성
 *
 * 제목, 내용, 패치 날짜를 입력받아 새로운 패치 노트 생성
 */
export async function createPatchNote(
	data: PatchNoteCreateRequest
): Promise<PatchNoteCreateResponse> {
	return post<PatchNoteCreateResponse>('/api/v1/patchnotes', data);
}

/**
 * 패치 노트 목록 조회
 *
 * 필터 없이 조회 시: 최신순으로 전체 조회
 * 날짜 범위로 필터링 가능
 */
export async function getPatchNotes(params?: {
	start_date?: string;
	end_date?: string;
	limit?: number;
	offset?: number;
}): Promise<PatchNoteListResponse> {
	const queryString = params
		? '?' +
		  new URLSearchParams(
				Object.entries(params)
					.filter(([_, value]) => value !== undefined)
					.map(([key, value]) => [key, String(value)])
		  ).toString()
		: '';

	return get<PatchNoteListResponse>(`/api/v1/patchnotes${queryString}`);
}

/**
 * 단일 패치 노트 조회
 *
 * ID로 특정 패치 노트 조회
 */
export async function getPatchNoteById(patchNoteId: number): Promise<PatchNoteResponse> {
	return get<PatchNoteResponse>(`/api/v1/patchnotes/${patchNoteId}`);
}

/**
 * 패치 노트 수정
 *
 * 제목, 내용, 패치 날짜 수정 가능
 */
export async function updatePatchNote(
	patchNoteId: number,
	request: PatchNoteUpdateRequest
): Promise<PatchNoteResponse> {
	return patch<PatchNoteResponse>(`/api/v1/patchnotes/${patchNoteId}`, request);
}

/**
 * 패치 노트 삭제
 *
 * ID로 특정 패치 노트 삭제
 */
export async function deletePatchNote(patchNoteId: number): Promise<PatchNoteDeleteResponse> {
	return del<PatchNoteDeleteResponse>(`/api/v1/patchnotes/${patchNoteId}`);
}
