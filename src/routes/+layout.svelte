<script lang="ts">
	import { type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';
	import SvgRoot from '$lib/components/svg/SvgRoot.svelte';
	import TagIcon from '$lib/components/svg/icons/TagIcon.svelte';
	import '../app.css';
	import type { LayoutData } from './$types';
	import Notification from '$lib/components/ui/FloatingUI/Notification.svelte';
	import ConfirmDialog from '$lib/components/ui/FloatingUI/ConfirmDialog.svelte';

	let { data, children }: { data: LayoutData, children: Snippet } = $props();
	let { navItems } = data;
	
	const styleProps: Record<string, string> = {
		'--updated-brightness': '1',
		'--updated-saturate': '1',
		'--updated-blur': '0',
		'--updated-z-index': '1',
		'--updated-transition': 'filter 1s'
	};

	let currentPath: string = $derived(page.url.pathname);
	let isBackgroundActive: boolean = $state(false);
	
	function toggleBackground(): void {
		isBackgroundActive = !isBackgroundActive;
		
		const appElement: HTMLElement = document.querySelector('.app') as HTMLElement;
		Object.entries(styleProps).forEach(([key, value]) => 
			isBackgroundActive ? appElement.style.setProperty(key, value) : appElement.style.removeProperty(key)
		);
	}
</script>

<!-- Svg 설정 초기화 태그 -->
<SvgRoot />
<Notification />
<ConfirmDialog />
<div class="app">
	<!-- 배경 보기 Button 영역-->
	<div id="show-bg-container">
		<div id="show-bg-btn-label">클릭해서 배경 보기!</div>
		<button id="show-bg-btn" onclick={toggleBackground}>
			<img id='semin-img' src="/images/semin.png" alt="😊" />
		</button>
	</div>

	<!-- 메인 영역 Start -->
	<div class="layout">
		<!-- 사이드바 영역 Start -->
		<nav class="sidebar">
			<div class="sidebar__block">
				<a href="/" class="sidebar__title">
					<span class="sidebar__title__text">Mydata Assist</span>
				</a>
				<div class="sidebar__tabs">
					{#each navItems as { path, label, tag }}
						<a href={path} class="sidebar__tab" class:active={currentPath.startsWith(path)}>
							<TagIcon tagName={tag} />
							<span class="sidebar__tab__text">{label}</span>
						</a>
					{/each}
				</div>
			</div>
			<div class="sidebar__block">
				<a href="/patch-note" class="sidebar__patch-note">
					<span class="sidebar__patch-note__text">패치 노트</span>
				</a>
			</div>
		</nav>
		<!-- 사이드바 영역 End -->

		<!-- 자식 영역 Start -->
		{#key currentPath}
			<div class="container" in:fade={{ duration: 150, delay: 150 }}>
				{@render children()}
			</div>
		{/key}
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
		filter: brightness(var(--updated-brightness, 0.15)) saturate(var(--updated-saturate, 0.8)) blur(var(--updated-blur, 3px)); /* 효과 적용 */
		z-index: var(--updated-z-index, -1);
		transition: var(--updated-transition, filter 0.5s);
	}

	#show-bg-container {
		position: absolute;
		top: 10%;
		left: 0;
		display: flex;
		flex-direction: column;
		background: none;
		border: none;
		z-index: 2;
	}

	#show-bg-container #show-bg-btn-label {
		font-size: 0.8rem;
		color: var(--color-text-2); 
		width: max-content;
		opacity: 0;
	}

	#show-bg-container #show-bg-btn {
		border: none;
		background: none;
	}

	#show-bg-container #show-bg-btn #semin-img {
		width: 2.5rem;
		height: 2.5rem;
		filter: brightness(0.5) saturate(0.5) blur(5px);
		clip-path: circle(50% at 50% 50%);
		background: none;
		border: none;
	}

	#show-bg-container:hover #show-bg-btn-label {
		opacity: 1;
		transition: opacity .8s;
	}

	#show-bg-container:hover #show-bg-btn #semin-img {
		filter: brightness(1) saturate(1) blur(0);
		transform: scale(1.1);
		transition: all 1s;
	}

	.layout {
		display: flex;
		background: linear-gradient(to right bottom, var(--color-bg-1), var(--color-bg-2));
		backdrop-filter: blur(50px);
		height: 80vh;
		width: 85vw;
		border-radius: 2rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		border-left: 1px solid rgba(255, 255, 255, 0.1);
	}

	.sidebar {
		height: 100%;
		flex: 0 0 max-content;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
      	text-align: center;
		border-top-left-radius: 1.8rem;
		border-bottom-left-radius: 1.8rem;
		background: linear-gradient(to right bottom, var(--color-bg-1), var(--color-bg-2));
		padding: 2rem 1.5rem;
	}

	.container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 2rem;
		overflow: hidden;
	}

	.sidebar__block {
		width: 100%;
	}

	.sidebar__title {
		display: flex;
		flex-direction: row;
		align-items: center;
		border-bottom: 1px solid gray;
		height: 3rem;
	}

	.sidebar__title__text {
		font-size: 1.5rem;
		font-weight: bold;
		background: linear-gradient(135deg, #e9534e, #f35597, #ef734e, #ecb214);
		background-clip: text;
		color: transparent;
		margin-bottom: 0.8rem;
	}

	.sidebar__tabs {
		width: 100%;
		display: flex;
		flex-direction: column;
		margin-top: 0.4em;
	}

	.sidebar__tab {
		display: flex;
		flex-direction: row;
		align-items: center;
		text-align: center;
		justify-content: left;
		padding: 0.4rem 0;
	}

	.sidebar__tab:hover,
	.sidebar__tab.active {
		transform: scale(1.05);
		transform-origin: left;
		transition: transform 0.4s;
		background: linear-gradient(to right bottom, var(--color-secondary-1), var(--color-secondary-2));
		background-clip: text;
		color: transparent;
	}

	.sidebar__tab__text {
		margin-left: 0.7rem;
		font-size: 1.2rem;
	}

	.sidebar__patch-note {
		padding: 0.7rem 1.5rem;
		border-radius: 1.5rem;
		background: linear-gradient(to right bottom, var(--color-bg-1), var(--color-bg-2));
	}

	.sidebar__patch-note__text {
		font-size: 1.1rem;
		font-weight: 600;
	}
</style>
