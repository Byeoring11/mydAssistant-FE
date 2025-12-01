<script lang="ts">
	import serviceInfEaiYes from '$lib/images/service_inf_eai.png';
	import serviceInfEaiNo from '$lib/images/service_inf_no_eai.png';
	import serviceInfCore from '$lib/images/service_inf_core.png';

	// ============================================================================
	// Types & Interfaces
	// ============================================================================

	interface ExampleData {
		id: string;
		url: string;
		alt: string;
		title: string;
		color: string;
		icon: string;
	}

	// ============================================================================
	// State Management
	// ============================================================================

	let selectedId = $state<string>('eai-yes');
	let isImageLoading = $state(false);

	// ============================================================================
	// Constants
	// ============================================================================

	const examples: ExampleData[] = [
		{
			id: 'eai-yes',
			url: serviceInfEaiYes,
			alt: 'EAI 호출 포함',
			title: 'EAI 호출이 있는 경우',
			color: '#8b5cf6',
			icon: '①'
		},
		{
			id: 'eai-no',
			url: serviceInfEaiNo,
			alt: 'EAI 호출 제외',
			title: 'EAI 호출이 없는 경우',
			color: '#06b6d4',
			icon: '②'
		},
		{
			id: 'core',
			url: serviceInfCore,
			alt: '코어 시스템 연계',
			title: '코어 연계의 경우',
			color: '#ec4899',
			icon: '③'
		}
	];

	// ============================================================================
	// Derived State
	// ============================================================================

	const selectedExample = $derived(examples.find((ex) => ex.id === selectedId));
	const showCoreNotice = $derived(selectedId === 'core');

	// ============================================================================
	// Event Handlers
	// ============================================================================

	const handleSelect = (id: string): void => {
		if (selectedId === id) return;
		isImageLoading = true;
		selectedId = id;
	};

	const handleImageLoad = (): void => {
		isImageLoading = false;
	};
</script>

<div class="container">
	<!-- Top Navigation -->
	<nav class="top-nav">
		{#each examples as example}
			<button
				class="tab"
				class:active={selectedId === example.id}
				onclick={() => handleSelect(example.id)}
				style="--accent-color: {example.color}"
			>
				<span class="tab-icon">{example.icon}</span>
				<span class="tab-title">{example.title}</span>
			</button>
		{/each}
	</nav>

	<!-- Image Viewer -->
	{#if selectedExample}
		<div class="content-wrapper">
			{#key selectedExample.id}
				<div class="viewer">
					<img
						src={selectedExample.url}
						alt={selectedExample.alt}
						class="image"
						class:loaded={!isImageLoading}
						onload={handleImageLoad}
					/>
				</div>
			{/key}

			<!-- Core Notice -->
			{#if showCoreNotice}
				<div class="notice">
					<div class="notice-icon">💡</div>
					<p class="notice-text">
						<span class="highlight">과거서비스CODE</span>와
						<span class="highlight">관련팀명</span>은 없는 경우 입력하지 않아도 됩니다
					</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		min-height: 100vh;
	}

	/* Top Navigation */
	.top-nav {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 2rem;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.875rem;
		overflow: hidden;
	}

	.tab::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, white));
		opacity: 0;
		transition: opacity 0.3s ease;
		border-radius: 2rem;
		z-index: -1;
	}

	.tab:hover {
		color: rgba(255, 255, 255, 0.95);
		background: rgba(255, 255, 255, 0.08);
		border-color: color-mix(in srgb, var(--accent-color) 60%, transparent);
		transform: translateY(-2px);
		box-shadow: 
			0 4px 12px rgba(0, 0, 0, 0.2),
			0 0 20px color-mix(in srgb, var(--accent-color) 50%, transparent),
			0 0 40px color-mix(in srgb, var(--accent-color) 30%, transparent);
	}

	.tab:hover::before {
		opacity: 0.6;
	}

	.tab.active {
		color: #ffffff;
		border-color: color-mix(in srgb, var(--accent-color) 50%, transparent);
		background: linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 25%, transparent), color-mix(in srgb, var(--accent-color) 20%, transparent));
		box-shadow: 0 4px 16px color-mix(in srgb, var(--accent-color) 40%, transparent);
	}

	.tab.active::before {
		opacity: 0;
	}

	.tab-icon {
		font-size: 1.125rem;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
	}

	.tab-title {
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	/* Content Wrapper */
	.content-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 2rem;
	}

	/* Viewer */
	.viewer {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: flex-start;
	}

	.image {
		max-width: 100%;
		height: auto;
		display: block;
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.image.loaded {
		opacity: 1;
	}

	/* Notice */
	.notice {
		display: inline-flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1rem;
		background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1));
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(236, 72, 153, 0.3);
		border-radius: 1rem;
		box-shadow: 0 4px 16px rgba(236, 72, 153, 0.15);
	}

	.notice-icon {
		font-size: 1.2rem;
		flex-shrink: 0;
		filter: drop-shadow(0 2px 4px rgba(236, 72, 153, 0.4));
	}

	.notice-text {
		margin: 0;
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.9);
	}

	.notice-text .highlight {
		color: #ec4899;
		font-weight: 700;
		padding: 0.125rem 0.5rem;
		background: rgba(236, 72, 153, 0.2);
		border-radius: 0.375rem;
		text-shadow: 0 0 10px rgba(236, 72, 153, 0.3);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.top-nav {
			flex-direction: column;
			align-items: stretch;
		}

		.tab {
			justify-content: center;
		}

		.content-wrapper {
			padding: 1rem;
			gap: 1rem;
		}

		.notice {
			flex-direction: column;
			text-align: center;
		}
	}
</style>