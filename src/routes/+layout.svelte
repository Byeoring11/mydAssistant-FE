<script lang="ts">
	import '../app.css'
	import { page } from '$app/state'
	import SvgRoot from '$lib/components/svg/SvgRoot.svelte';
	import TagIcon from '$lib/components/svg/icons/TagIcon.svelte';
	import ContainerTitle from '$lib/components/ui/ContainerTitle/ContainerTitle.svelte';

	let { children } = $props();

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

	let isBackgroundActive: boolean = $state(false);
	function showBackground(): void {
		isBackgroundActive = !isBackgroundActive;

		const styleProps: Record<string, string> = {
			'--updated-brightness': '1',
			'--updated-saturate': '1',
			'--updated-blur': '0',
			'--updated-z-index': '1',
			'--updated-transition': 'filter 1s'
		};
		
		const appElement: HTMLElement = document.querySelector('.app') as HTMLElement;
		Object.entries(styleProps).forEach(([key, value]) => isBackgroundActive ? appElement.style.setProperty(key, value) : appElement.style.removeProperty(key));
	}
</script>

<!-- Svg 설정 초기화 태그 -->
<SvgRoot />

<div class="app">
	<!-- 배경 보기 Button 영역-->
	<button id="show-bg-btn" onclick={showBackground}>
		<img id='semin-img' src="/images/semin.png" alt="😊" />
	</button>

	<!-- 메인 영역 Start -->
	<div class="layout">
		<!-- 사이드바 영역 Start -->
		<nav class="sidebar">
			<div class="title underline">
				<a href="/">POMI</a>
			</div>

			<div class="tabs">
				{#each navItems as { path, label, tag }}
					<a href={path} class="tab" class:active={currentPath.startsWith(path)}>
						<TagIcon tagName={tag} /><h2>{label}</h2>
					</a>
				{/each}
			</div>
			
			<div class="patch-note">
				<a href="/"><h3>패치노트</h3></a>
			</div>
		</nav>
		<!-- 사이드바 영역 End -->

		<!-- 자식 영역 Start -->
		<div class="container">
			{#if currentPath !== '/'}
				<ContainerTitle />
			{/if}
			<main>
				{@render children()}
			</main>
		</div>
		<!-- 자식 영역 End -->
	</div>
	<!-- 메인 영역 End -->
</div>

<style>
	.app {
		position: relative;
		min-height: 100vh;
		display: flex;
    	align-items: center;
    	justify-content: center;
	}

	.app::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: url('/images/members.jpg');
		background-size: cover;
		background-position: center;
		filter: brightness(var(--updated-brightness, 0.03)) saturate(var(--updated-saturate, 0.8)) blur(var(--updated-blur, 3px)); /* 효과 적용 */
		z-index: var(--updated-z-index, -1); /* 텍스트 아래로 */
		transition: var(--updated-transition, filter 1s);
	}

	#show-bg-btn {
		position: absolute;
		top: 10%;
		left: 5%;
		background: none;
		border: none;
		filter: blur(5px);
		z-index: 2;
	}

	#show-bg-btn:hover {
		filter: blur(0);
		transition: 1s;
	}

	#show-bg-btn:hover::before {
		position: absolute;
		top: -2rem;
		left: -4rem;
		content: "클릭하면 배경을 볼 수 있어요!";
		color: var(--color-text-2); 
		width: max-content;
	}

	#show-bg-btn #semin-img {
		width: 2.5rem;
		height: 2.5rem;
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
