<script lang="ts">
	import { updateLoadHistoryNote, type LoadHistoryResponse } from '$lib/api/stubApi';
	import { showNotification } from '$lib/components/ui/FloatingUI/notificationStore';

	interface Props {
		history: LoadHistoryResponse;
		onSaved: () => void;
		onClose: () => void;
	}

	let { history, onSaved, onClose }: Props = $props();

	let noteValue = $state(history.note || '');
	let saving = $state(false);

	/**
	 * Note 저장
	 */
	async function saveNote(): Promise<void> {
		if (saving) return;

		saving = true;
		try {
			await updateLoadHistoryNote(history.id, { note: noteValue });
			showNotification('success', 'Note가 저장되었습니다.');
			onSaved();
		} catch (error) {
			console.error('[NOTE-EDIT] Failed to save note:', error);
			showNotification('error', 'Note 저장에 실패했습니다.');
		} finally {
			saving = false;
		}
	}

	/**
	 * ESC 키로 모달 닫기
	 */
	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	/**
	 * 오버레이 클릭으로 모달 닫기
	 */
	function handleOverlayClick(e: MouseEvent): void {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	/**
	 * 시간 포맷팅
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
	 * 실행 시간 포맷팅
	 */
	function formatExecutionTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="modal-overlay" onclick={handleOverlayClick}>
	<div class="modal">
		<!-- 헤더 -->
		<div class="modal-header">
			<h3>대응답 적재 이력 상세</h3>
			<button class="close-btn" onclick={onClose}>✕</button>
		</div>

		<!-- 내용 -->
		<div class="modal-body">
			<!-- 이력 정보 -->
			<div class="info-section">
				<div class="info-grid">
					<div class="info-item">
						<span class="label">ID</span>
						<span class="value">{history.id}</span>
					</div>
					<div class="info-item">
						<span class="label">고객번호</span>
						<span class="value">{history.customer_number}</span>
					</div>
					<div class="info-item">
						<span class="label">Client IP</span>
						<span class="value">{history.client_ip}</span>
					</div>
					<div class="info-item">
						<span class="label">실행 시간</span>
						<span class="value">{formatExecutionTime(history.execution_time_seconds)}</span>
					</div>
					<div class="info-item wide">
						<span class="label">Batch ID</span>
						<span class="value batch-id">{history.batch_id}</span>
					</div>
					<div class="info-item">
						<span class="label">시작 시간</span>
						<span class="value">{formatDateTime(history.started_at)}</span>
					</div>
					<div class="info-item">
						<span class="label">완료 시간</span>
						<span class="value">{formatDateTime(history.completed_at)}</span>
					</div>
					{#if history.connection_id}
						<div class="info-item wide">
							<span class="label">Connection ID</span>
							<span class="value connection-id">{history.connection_id}</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Note 편집 -->
			<div class="note-section">
				<label for="note-input">Note</label>
				<textarea
					id="note-input"
					bind:value={noteValue}
					placeholder="메모를 입력하세요..."
					rows="6"
				></textarea>
			</div>
		</div>

		<!-- 푸터 -->
		<div class="modal-footer">
			<button class="btn-cancel" onclick={onClose} disabled={saving}>취소</button>
			<button class="btn-save" onclick={saveNote} disabled={saving}>
				{#if saving}
					<span class="spinner-small"></span>
					<span>저장 중...</span>
				{:else}
					<span>💾</span>
					<span>저장</span>
				{/if}
			</button>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background: rgba(30, 30, 40, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.5),
			0 0 40px rgba(96, 165, 250, 0.1);
		max-width: 700px;
		width: 100%;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		animation: modalFadeIn 0.3s ease;
	}

	@keyframes modalFadeIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1.3rem;
		font-weight: 600;
		background: linear-gradient(to right bottom, rgba(96, 165, 250, 0.9), rgba(139, 92, 246, 0.9));
		background-clip: text;
		color: transparent;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		padding: 0;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		color: white;
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		background: rgba(239, 68, 68, 0.3);
		border-color: rgba(239, 68, 68, 0.5);
	}

	.modal-body {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.info-section {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		padding: 1.25rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.info-item.wide {
		grid-column: span 2;
	}

	.label {
		font-size: 0.8rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.value {
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.9);
	}

	.batch-id,
	.connection-id {
		font-family: monospace;
		font-size: 0.85rem;
		color: rgba(139, 92, 246, 0.9);
		word-break: break-all;
	}

	.note-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.note-section label {
		font-size: 0.9rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
	}

	textarea {
		width: 100%;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		color: white;
		font-size: 0.95rem;
		font-family: inherit;
		resize: vertical;
		transition: all 0.2s ease;
	}

	textarea::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	textarea:focus {
		outline: none;
		border-color: rgba(96, 165, 250, 0.5);
		background: rgba(255, 255, 255, 0.12);
		box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.btn-cancel,
	.btn-save {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-cancel {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.btn-cancel:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.btn-save {
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(139, 92, 246, 0.9));
		color: white;
		box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
	}

	.btn-save:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(96, 165, 250, 0.4);
	}

	.btn-cancel:disabled,
	.btn-save:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.spinner-small {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 768px) {
		.modal {
			max-width: 100%;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}

		.info-item.wide {
			grid-column: span 1;
		}
	}
</style>
