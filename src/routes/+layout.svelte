<script lang="ts">
	import '../app.css';
	import { page } from '$app/state'
	import SvgRoot from '$lib/components/svg/SvgRoot.svelte';
	import TagIcon from '$lib/components/svg/icons/TagIcon.svelte';
	import ContainerTitle from '$lib/components/ui/ContainerTitle/ContainerTitle.svelte';

	interface NavItem {
		path: string;
		label: string;
		tag: string;
  	}

	const navItems: NavItem[] = [
		{ path: '/deud', label: '대응답', tag: 'deud' },
		{ path: '/bxm5', label: 'BXM5', tag: 'bxm5' },
		{ path: '/bxm4', label: 'BXM4', tag: 'bxm4' },
		{ path: '/diff', label: 'Diff', tag: 'diff' },
		{ path: '/utils', label: 'Utils', tag: 'utils' }
	];

	let currentPath: String = $derived(page.url.pathname);

	let { children } = $props();
</script>

<SvgRoot />

<div class="app">
	<div class="layout">
		<!-- 사이드바 영역 Start -->
		<nav class="sidebar">
			<!-- Title 영역 -->
			<div class="title">
				<a href="/">POMI</a>
			</div>
			<!-- Tab 영역 -->
			<div class="tabs">
				{#each navItems as { path, label, tag }}
					<a href={path} class="tab" class:active={currentPath.startsWith(path)}>
						<TagIcon tagName={tag} /><h2>{label}</h2>
					</a>
				{/each}
			</div>
			<!-- 패치노트 영역-->
			<div class="patch-note">
				<a href="/"><h3>패치노트</h3></a>
			</div>
		</nav>
		<!-- 사이드바 영역 End -->

		<!-- 메인 영역 Start -->
		<div class="container">
			{#if currentPath !== '/'}
				<ContainerTitle />
			{/if}
			<main>
				{@render children()}
			</main>
		</div>
		<!-- 메인 영역 End -->
	</div>
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
    	align-items: center;
    	justify-content: center;
	}

	.layout {
		display: flex;
		background: linear-gradient(to right bottom, var(--color-bg-1), var(--color-bg-2));
		height: 90vh;
		width: 80vw;
		border-radius: 3rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		border-left: 1px solid rgba(255, 255, 255, 0.1);
	}

	.sidebar {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
      	text-align: center;
      	justify-content: space-between;
		border-top-left-radius: 2.5rem;
		border-bottom-left-radius: 2.5rem;
		background: linear-gradient(to right bottom, var(--color-bg-1), var(--color-bg-2));
		padding: 2rem;
	}

	.container {
		display: flex;
		flex: 5;
		flex-direction: column;
		padding: 2rem;
		overflow: auto;
	}

	.tabs {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
	}

	.tabs .tab {
		width: 100%;
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		margin: 0.5rem;
		padding: 0.5rem 2.5rem;
	}

	.tabs .tab::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 1rem;
		z-index: -1;
		background: linear-gradient(to right bottom, var(--color-secondary-1), var(--color-secondary-2));
		opacity: 0;
	}

	.tabs .tab:hover::before,
	.tabs .tab.active::before {
		border-radius: 2rem;
		transition: opacity 0.8s ease-out, border-radius 0.5s ease-out;
		opacity: 1;
		background: linear-gradient(to right bottom, var(--color-secondary-1), var(--color-secondary-2));
	}

	.tabs .tab h2 {
		padding: 0 1rem;
	}

	.patch-note {
		display: flex;
		background: linear-gradient(to right bottom, var(--color-primary-1), var(--color-primary-2));
		border-radius: 2rem;
		color: white;
		padding: 0.5rem 2.5rem;
	}
</style>
