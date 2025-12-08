<script lang="ts">
	interface Props {
		logs: string[];
	}

	let { logs }: Props = $props();
	let logContainer: HTMLDivElement;

	// 로그가 업데이트될 때마다 자동 스크롤 (Svelte 5 runes mode)
	$effect(() => {
		if (logContainer && logs.length > 0) {
			logContainer.scrollTop = logContainer.scrollHeight;
		}
	});
</script>

<div class="output-section">
	<div class="output-header">
		<h3>실시간 출력 로그</h3>
	</div>
	<div class="output-logs" bind:this={logContainer}>
		{#if logs.length === 0}
			<div class="empty-log">로그가 없습니다.</div>
		{:else}
			{#each logs as log}
				<div class="log-line">{log}</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	/* 출력 로그 */
	.output-section {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.output-header {
		margin-bottom: 1rem;
	}

	.output-header h3 {
		margin: 0;
		font-size: 1.3rem;
		background: linear-gradient(
			to right bottom,
			rgba(96, 165, 250, 0.9),
			rgba(139, 92, 246, 0.9)
		);
		background-clip: text;
		color: transparent;
	}

	.output-logs {
		flex: 1;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		padding: 1rem;
		overflow-y: auto;
		font-size: 0.75rem;
		line-height: 1.6;
		min-height: 0;
		scroll-behavior: smooth;
	}

	/* 스크롤바 스타일 (glassmorphism) */
	.output-logs::-webkit-scrollbar {
		width: 8px;
	}

	.output-logs::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
	}

	.output-logs::-webkit-scrollbar-thumb {
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(139, 92, 246, 0.3));
		border-radius: 4px;
		backdrop-filter: blur(10px);
	}

	.output-logs::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(135deg, rgba(96, 165, 250, 0.5), rgba(139, 92, 246, 0.5));
	}

	.empty-log {
		color: rgba(255, 255, 255, 0.4);
		text-align: center;
		padding: 2rem;
	}

	.log-line {
		color: rgba(255, 255, 255, 0.9);
		white-space: pre-wrap;
		word-break: break-all;
	}
</style>
