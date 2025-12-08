<script lang="ts">
	import type { LoadHistoryResponse } from '$lib/api/stubApi';

	interface Props {
		histories: LoadHistoryResponse[];
		loading: boolean;
		currentPage: number;
		pageSize: number;
		total: number;
		onRowClick: (history: LoadHistoryResponse) => void;
		onPageChange: (page: number) => void;
	}

	let { histories, loading, currentPage, pageSize, total, onRowClick, onPageChange }: Props =
		$props();

	const totalPages = $derived(Math.ceil(total / pageSize));
	const paginationPages = $derived(getPaginationPages(currentPage, totalPages));

	/**
	 * 시간 포맷팅 (YYYY-MM-DD HH:mm:ss)
	 */
	function formatDateTime(isoString: string): string {
		const date = new Date(isoString);
		return date.toLocaleString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
	}

	/**
	 * 실행 시간 포맷팅 (초 → MM:SS)
	 */
	function formatExecutionTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}

	/**
	 * Note 미리보기 (최대 30자)
	 */
	function previewNote(note: string | null): string {
		if (!note) return '-';
		return note.length > 30 ? note.substring(0, 30) + '...' : note;
	}

	/**
	 * 페이지네이션 버튼 배열 생성
	 */
	function getPaginationPages(current: number, total: number): (number | string)[] {
		if (total <= 7) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		const pages: (number | string)[] = [1];

		if (current > 3) {
			pages.push('...');
		}

		const start = Math.max(2, current - 1);
		const end = Math.min(total - 1, current + 1);

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (current < total - 2) {
			pages.push('...');
		}

		pages.push(total);

		return pages;
	}
</script>

<div class="table-container">
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>이력을 불러오는 중...</p>
		</div>
	{:else if histories.length === 0}
		<div class="empty">
			<p>조회된 이력이 없습니다.</p>
		</div>
	{:else}
		<div class="table-wrapper">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>고객번호</th>
						<th>Client IP</th>
						<th>실행 시간</th>
						<th>시작 시간</th>
						<th>완료 시간</th>
						<th>Note</th>
					</tr>
				</thead>
				<tbody>
					{#each histories as history (history.id)}
						<tr onclick={() => onRowClick(history)}>
							<td>{history.id}</td>
							<td>{history.customer_number}</td>
							<td>{history.client_ip}</td>
							<td>{formatExecutionTime(history.execution_time_seconds)}</td>
							<td>{formatDateTime(history.started_at)}</td>
							<td>{formatDateTime(history.completed_at)}</td>
							<td class="note-preview">{previewNote(history.note)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- 페이지네이션 -->
		{#if totalPages > 1}
			<div class="pagination">
				<button
					class="page-btn"
					disabled={currentPage === 1}
					onclick={() => onPageChange(currentPage - 1)}
				>
					◀
				</button>

				{#each paginationPages as page}
					{#if page === '...'}
						<span class="ellipsis">...</span>
					{:else}
						<button
							class="page-btn"
							class:active={page === currentPage}
							onclick={() => onPageChange(page as number)}
						>
							{page}
						</button>
					{/if}
				{/each}

				<button
					class="page-btn"
					disabled={currentPage === totalPages}
					onclick={() => onPageChange(currentPage + 1)}
				>
					▶
				</button>
			</div>
		{/if}

		<!-- 결과 정보 -->
		<div class="result-info">
			<p>
				전체 <strong>{total}</strong>건 중 <strong>{(currentPage - 1) * pageSize + 1}</strong>~<strong
					>{Math.min(currentPage * pageSize, total)}</strong
				>건 표시
			</p>
		</div>
	{/if}
</div>

<style>
	.table-container {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 1.5rem;
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	/* 로딩 상태 */
	.loading,
	.empty {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(96, 165, 250, 0.2);
		border-top-color: rgba(96, 165, 250, 0.8);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* 테이블 */
	.table-wrapper {
		flex: 1;
		overflow: auto;
		border-radius: 8px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	thead {
		position: sticky;
		top: 0;
		background: rgba(96, 165, 250, 0.15);
		backdrop-filter: blur(10px);
		z-index: 1;
	}

	th {
		padding: 1rem;
		text-align: left;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		white-space: nowrap;
	}

	tbody tr {
		cursor: pointer;
		transition: all 0.2s ease;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	tbody tr:hover {
		background: rgba(96, 165, 250, 0.1);
		backdrop-filter: blur(10px);
	}

	td {
		padding: 0.875rem 1rem;
		color: rgba(255, 255, 255, 0.8);
		white-space: nowrap;
	}

	.batch-id {
		font-family: monospace;
		font-size: 0.85rem;
		color: rgba(139, 92, 246, 0.9);
	}

	.note-preview {
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		color: rgba(255, 255, 255, 0.6);
		font-style: italic;
	}

	/* 페이지네이션 */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.page-btn {
		min-width: 36px;
		height: 36px;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		color: white;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.page-btn:hover:not(:disabled) {
		background: rgba(96, 165, 250, 0.2);
		border-color: rgba(96, 165, 250, 0.4);
	}

	.page-btn.active {
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(139, 92, 246, 0.9));
		border-color: transparent;
		box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
	}

	.page-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.ellipsis {
		color: rgba(255, 255, 255, 0.4);
		padding: 0 0.5rem;
	}

	/* 결과 정보 */
	.result-info {
		text-align: center;
		margin-top: 1rem;
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.875rem;
	}

	.result-info strong {
		color: rgba(96, 165, 250, 0.9);
		font-weight: 600;
	}
</style>
