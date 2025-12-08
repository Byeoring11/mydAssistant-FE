<script lang="ts">
	import type { ServerHealth, SessionStatus } from '../../types';

	interface Props {
		connected: boolean;
		isServerHealthy: boolean;
		isOccupiedByOthers: boolean;
		sessionStatus: SessionStatus;
		inputCusno: string;
		inputValidationState: 'idle' | 'valid' | 'invalid' | 'partial';
		canStart: boolean;
		isWorkflowRunning: boolean;
		onInputChange: (value: string) => void;
		onInputBlur: () => void;
		onKeyDown: (e: KeyboardEvent) => void;
		onStart: () => void;
		onStop: () => void;
	}

	let {
		connected,
		isServerHealthy,
		isOccupiedByOthers,
		sessionStatus,
		inputCusno = $bindable(),
		inputValidationState,
		canStart,
		isWorkflowRunning,
		onInputChange,
		onInputBlur,
		onKeyDown,
		onStart,
		onStop
	}: Props = $props();
</script>

<div class="control-bar">
	<!-- 좌측: 상태 표시 -->
	<div class="status-section">
		<div
			class="status-dot"
			class:connected={connected && isServerHealthy}
			class:occupied={isOccupiedByOthers}
		></div>
		<div class="status-info">
			<span class="status-text">
				{#if !connected}
					Websocket 연결 끊김
				{:else if !isServerHealthy}
					박지현의 하이웨어가 아마 잠김 상태인듯?
				{:else if isOccupiedByOthers}
					<span class="isOccupied">다른 사용자가 대응답 진행 중</span>
				{:else if sessionStatus.active}
					대응답 적재 진행 중
				{:else}
					대응답 적재 가능
				{/if}
			</span>
		</div>
	</div>

	<!-- 중앙: 고객번호 입력 -->
	<div class="input-section-compact">
		<div
			class="input-wrapper"
			class:valid={inputValidationState === 'valid'}
			class:invalid={inputValidationState === 'invalid'}
		>
			<input
				id="customer-number"
				type="text"
				class="input-field"
				bind:value={inputCusno}
				oninput={(e) => onInputChange((e.target as HTMLInputElement).value)}
				onblur={onInputBlur}
				onkeydown={onKeyDown}
				placeholder="고객번호 입력 (스페이스바 또는 Enter로 추가, 복붙으로 여러개 입력 가능)"
				disabled={isWorkflowRunning}
			/>
			{#if inputValidationState === 'valid'}
				<span class="validation-icon valid">✓</span>
			{:else if inputValidationState === 'invalid'}
				<span class="validation-icon invalid">✗</span>
			{/if}
		</div>
	</div>

	<!-- 우측: 작업 버튼 -->
	<div class="action-buttons">
		<button class="start-btn" onclick={onStart} disabled={!canStart || isWorkflowRunning}>
			{isWorkflowRunning ? '진행 중...' : '작업 시작'}
		</button>
		{#if isWorkflowRunning}
			<button class="stop-btn" onclick={onStop}>중지</button>
		{/if}
	</div>
</div>

<style>
	/* 컨트롤 바 - 한 줄로 배치 */
	.control-bar {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 1rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	/* 좌측: 상태 섹션 */
	.status-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 180px;
	}

	.status-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: #ff3131;
		box-shadow:
			0 0 8px #ff3131,
			0 0 16px #ff3131;
		transition: all 0.3s ease;
		flex-shrink: 0;
	}

	.status-dot.connected {
		background-color: #00ff00;
		box-shadow:
			0 0 8px #00ff00,
			0 0 16px #00ff00;
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.status-dot.occupied {
		background: #f59e0b;
		box-shadow:
			0 0 8px rgba(245, 158, 11, 0.5),
			0 0 16px rgba(245, 158, 11, 0.5);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}

	.status-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.status-text {
		color: white;
		font-size: 0.875rem;
		font-weight: 600;
		white-space: nowrap;
	}

	/* 중앙: 입력 섹션 */
	.input-section-compact {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.input-wrapper {
		position: relative;
		width: 100%;
	}

	.input-wrapper.valid .input-field {
		border-color: rgba(16, 185, 129, 0.6);
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
	}

	.input-wrapper.invalid .input-field {
		border-color: rgba(239, 68, 68, 0.6);
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.validation-icon {
		position: absolute;
		right: 1rem;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1.25rem;
		font-weight: bold;
		pointer-events: none;
	}

	.validation-icon.valid {
		color: #10b981;
	}

	.validation-icon.invalid {
		color: #ef4444;
	}

	.input-field {
		width: 100%;
		padding: 0.7rem 2.5rem 0.7rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		color: white;
		font-size: 0.95rem;
		transition: all 0.2s ease;
	}

	.input-field::placeholder {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.875rem;
	}

	.input-field:focus {
		outline: none;
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(96, 165, 250, 0.6);
		box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
	}

	.input-field:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* 우측: 액션 버튼 */
	.action-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.start-btn {
		padding: 0.7rem 1.8rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 8px;
		color: white;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
	}

	.start-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
	}

	.start-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.stop-btn {
		padding: 0.7rem 1.5rem;
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		border: none;
		border-radius: 8px;
		color: white;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
	}

	.stop-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
	}
</style>
