<script lang="ts">
	import { onMount } from 'svelte';
	import { getLoadHistories, type LoadHistoryResponse } from '$lib/api/stubApi';
	import { showNotification } from '$lib/components/ui/FloatingUI/notificationStore';

	import { FilterBar, HistoryTable, NoteEditModal } from './components';

	// ============ State ============
	let histories = $state<LoadHistoryResponse[]>([]);
	let filteredHistories = $derived(filterHistories(histories, filters));
	let loading = $state(false);
	let selectedHistory = $state<LoadHistoryResponse | null>(null);
	let showNoteModal = $state(false);

	// ============ Filters ============
	let filters = $state({
		customerNumber: '',
		clientIp: '',
		note: ''
	});

	// ============ Pagination ============
	let currentPage = $state(1);
	let pageSize = $state(50);
	let total = $state(0);

	// ============ Functions ============

	/**
	 * 이력 목록 조회
	 */
	async function loadHistories(): Promise<void> {
		loading = true;
		try {
			const params = {
				customer_number: filters.customerNumber || undefined,
				client_ip: filters.clientIp || undefined,
				note: filters.note || undefined,
				limit: pageSize,
				offset: (currentPage - 1) * pageSize
			};

			const response = await getLoadHistories(params);
			histories = response.items;
			total = response.total;
		} catch (error) {
			console.error('[STUB-HISTORY] Failed to load histories:', error);
			showNotification('error', '이력 조회에 실패했습니다.');
		} finally {
			loading = false;
		}
	}

	/**
	 * 클라이언트 사이드 필터링
	 */
	function filterHistories(
		items: LoadHistoryResponse[],
		filterParams: typeof filters
	): LoadHistoryResponse[] {
		return items.filter((item) => {
			const matchCusno =
				!filterParams.customerNumber ||
				item.customer_number.includes(filterParams.customerNumber);
			const matchIp = !filterParams.clientIp || item.client_ip.includes(filterParams.clientIp);
			const matchNote =
				!filterParams.note || (item.note && item.note.includes(filterParams.note));

			return matchCusno && matchIp && matchNote;
		});
	}

	/**
	 * 필터 적용
	 */
	function applyFilters(): void {
		currentPage = 1;
		loadHistories();
	}

	/**
	 * 필터 초기화
	 */
	function resetFilters(): void {
		filters.customerNumber = '';
		filters.clientIp = '';
		filters.note = '';
		currentPage = 1;
		loadHistories();
	}

	/**
	 * Row 클릭 핸들러
	 */
	function handleRowClick(history: LoadHistoryResponse): void {
		selectedHistory = history;
		showNoteModal = true;
	}

	/**
	 * Note 저장 성공 핸들러
	 */
	function handleNoteSaved(): void {
		// 목록 다시 조회
		loadHistories();
		showNoteModal = false;
		selectedHistory = null;
	}

	/**
	 * 모달 닫기 핸들러
	 */
	function handleModalClose(): void {
		showNoteModal = false;
		selectedHistory = null;
	}

	/**
	 * 페이지 변경
	 */
	function handlePageChange(page: number): void {
		currentPage = page;
		loadHistories();
	}

	// ============ Lifecycle ============
	onMount(() => {
		loadHistories();

		// 작업 이력 갱신 이벤트 리스너 등록
		const handleHistoryUpdate = () => {
			console.log('[STUB-HISTORY] History updated event received, reloading...');
			loadHistories();
		};

		window.addEventListener('stub-history-updated', handleHistoryUpdate);

		// Cleanup
		return () => {
			window.removeEventListener('stub-history-updated', handleHistoryUpdate);
		};
	});
</script>

<div class="container">
	<!-- 필터 영역 -->
	<FilterBar
		bind:customerNumber={filters.customerNumber}
		bind:clientIp={filters.clientIp}
		bind:note={filters.note}
		onApply={applyFilters}
		onReset={resetFilters}
	/>

	<!-- 테이블 영역 -->
	<HistoryTable
		histories={filteredHistories}
		{loading}
		{currentPage}
		{pageSize}
		{total}
		onRowClick={handleRowClick}
		onPageChange={handlePageChange}
	/>

	<!-- Note 편집 모달 -->
	{#if showNoteModal && selectedHistory}
		<NoteEditModal history={selectedHistory} onSaved={handleNoteSaved} onClose={handleModalClose} />
	{/if}
</div>

<style>
	.container {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 1rem 0;
	}
</style>
