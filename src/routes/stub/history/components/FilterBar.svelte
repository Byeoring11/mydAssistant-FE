<script lang="ts">
	interface Props {
		customerNumber: string;
		clientIp: string;
		note: string;
		onApply: () => void;
		onReset: () => void;
	}

	let { customerNumber = $bindable(''), clientIp = $bindable(''), note = $bindable(''), onApply, onReset }: Props = $props();
</script>

<div class="filter-bar">
	<div class="filter-title">
		<h3>대응답 적재 이력 조회</h3>
	</div>

	<div class="filter-inputs">
		<div class="input-group">
			<label for="customer-number">고객번호</label>
			<input
				id="customer-number"
				type="text"
				bind:value={customerNumber}
				placeholder="고객번호 입력"
				onkeydown={(e) => e.key === 'Enter' && onApply()}
			/>
		</div>

		<div class="input-group">
			<label for="client-ip">Client IP</label>
			<input
				id="client-ip"
				type="text"
				bind:value={clientIp}
				placeholder="IP 주소 입력"
				onkeydown={(e) => e.key === 'Enter' && onApply()}
			/>
		</div>

		<div class="input-group">
			<label for="note">Note</label>
			<input
				id="note"
				type="text"
				bind:value={note}
				placeholder="메모 내용 검색"
				onkeydown={(e) => e.key === 'Enter' && onApply()}
			/>
		</div>

		<div class="button-group">
			<button class="btn-search" onclick={onApply}>
				<span>🔍</span>
				<span>검색</span>
			</button>
			<button class="btn-reset" onclick={onReset}>
				<span>🔄</span>
				<span>초기화</span>
			</button>
		</div>
	</div>
</div>

<style>
	.filter-bar {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.filter-title h3 {
		margin: 0;
		font-size: 1.3rem;
		font-weight: 600;
		background: linear-gradient(to right bottom, rgba(96, 165, 250, 0.9), rgba(139, 92, 246, 0.9));
		background-clip: text;
		color: transparent;
	}

	.filter-inputs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		align-items: end;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.8);
	}

	.input-group input {
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		color: white;
		font-size: 0.95rem;
		transition: all 0.2s ease;
	}

	.input-group input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.input-group input:focus {
		outline: none;
		border-color: rgba(96, 165, 250, 0.5);
		background: rgba(255, 255, 255, 0.12);
		box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
	}

	.btn-search,
	.btn-reset {
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
		white-space: nowrap;
	}

	.btn-search {
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(139, 92, 246, 0.9));
		color: white;
		box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
	}

	.btn-search:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(96, 165, 250, 0.4);
	}

	.btn-search:active {
		transform: translateY(0);
	}

	.btn-reset {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.btn-reset:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.btn-reset:active {
		transform: scale(0.98);
	}

	@media (max-width: 768px) {
		.filter-inputs {
			grid-template-columns: 1fr;
		}

		.button-group {
			width: 100%;
		}

		.btn-search,
		.btn-reset {
			flex: 1;
		}
	}
</style>
