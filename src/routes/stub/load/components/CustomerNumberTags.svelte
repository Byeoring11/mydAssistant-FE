<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { receive } from '$lib/utils/transition/crossfade';
	import XIcon from '$lib/components/svg/icons/XIcon.svelte';

	interface Props {
		cusnoList: string[];
		isWorkflowRunning: boolean;
		onRemove: (index: number) => void;
	}

	let { cusnoList, isWorkflowRunning, onRemove }: Props = $props();
</script>

{#if cusnoList.length > 0}
	<div
		class="cusno-tags-container"
		in:fly={{ y: -10, duration: 300 }}
		out:fly={{ y: -10, duration: 200 }}
	>
		{#each cusnoList as cusno, index (cusno)}
			<div class="cusno-tag" in:receive={{ key: cusno }} animate:flip={{ duration: 350 }}>
				<span class="cusno-tag__text">{cusno}</span>
				<button
					class="cusno-tag__button"
					onclick={() => onRemove(index)}
					disabled={isWorkflowRunning}
				>
					<XIcon size={10} />
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	/* 태그 컨테이너 */
	.cusno-tags-container {
		background: rgba(255, 255, 255, 0.034);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 10px;
		padding: 0.75rem 1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.cusno-tag {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.8rem;
		background: linear-gradient(
			135deg,
			rgba(96, 165, 250, 0.3),
			rgba(139, 92, 246, 0.3)
		);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(96, 165, 250, 0.4);
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.cusno-tag:hover {
		background: linear-gradient(
			135deg,
			rgba(96, 165, 250, 0.4),
			rgba(139, 92, 246, 0.4)
		);
		border-color: rgba(96, 165, 250, 0.6);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);
	}

	.cusno-tag__text {
		color: white;
		font-weight: 600;
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}

	.cusno-tag__button {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		color: rgba(255, 255, 255, 0.7);
		transition: all 0.2s ease;
	}

	.cusno-tag__button:hover:not(:disabled) {
		color: white;
		transform: scale(1.2);
	}

	.cusno-tag__button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
