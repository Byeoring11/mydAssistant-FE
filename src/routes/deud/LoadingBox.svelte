<script lang="ts">
	import { onMount } from 'svelte';
	import { Server, LoadingState } from '$lib/constants/server';
	import { timerStore } from './store/TimerStore';

	let { serverType, state }: { serverType: number, state: number } = $props();

    const LOADING_BOX_COLORS = ['#03e9f4', '#f355f4', '#ecb214'] as const;
	const serverName: string = Server[serverType];

	const loadingState: string = $derived(LoadingState[state]);
    
    onMount(() => {
		const h2Element: HTMLElement = document.querySelector(`#loading-box-${serverType}`) as HTMLElement;
		h2Element.style.setProperty('--loading-box-color', LOADING_BOX_COLORS[serverType - 1]);
	});

</script>

<div id="loading-box-{serverType}" class="step-block__loading-box step-block__loading-box--{loadingState}">
	<div class="step-block__loading-box__border">
		<span></span>
		<span></span>
		<span></span>
		<span></span>
	</div>
	<h2 class="step-block__loading-box__text">
		{serverName}
	</h2>
	<br>
	<div class="step-block__loading-box__time">
		{$timerStore[serverName].min}:{$timerStore[serverName].sec}:{$timerStore[serverName].msec}
	</div>
</div>

<style>
	/* 기본 스타일 */
	.step-block__loading-box {
		--box-size: min(20rem, 27%);
        position: relative;
		width: var(--box-size);
        max-height: calc(20vh);
		aspect-ratio: 1/1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: rgba(26, 26, 31, 0.685);
		border-radius: 1rem;
		transition: all 0.5s ease;
		overflow: hidden;
		-webkit-box-reflect: below 1px linear-gradient(transparent, rgba(0, 0, 0, 0.116));
	}
	
	.step-block__loading-box:not(:last-child) {
		margin-right: 9%;
	}

	/* 로딩 상태별 스타일 */
	.step-block__loading-box--error,
	.step-block__loading-box--error:hover {
		box-shadow: 0 0 2rem 0.5px rgba(247, 48, 48, 0.87);
	}

	.step-block__loading-box--success:not(.step-block__loading-box--error),
	.step-block__loading-box:not(.step-block__loading-box--error):hover {
		background: var(--loading-box-color);
		color: #050801;
		box-shadow:
			0 0 5px var(--loading-box-color),
			0 0 25px var(--loading-box-color),
			0 0 50px var(--loading-box-color),
			0 0 75px var(--loading-box-color);
	}

	/* 로딩 박스 텍스트 스타일 */
	.step-block__loading-box__text {
		color: var(--loading-box-color);
		overflow: hidden;
		letter-spacing: 0.125rem;
		text-align: center;
		transition: 0.5s;
	}

	.step-block__loading-box--error .step-block__loading-box__text {
		color: red;
	}

	.step-block__loading-box--loading .step-block__loading-box__text {
		animation: typing 5s infinite;
	}

	.step-block__loading-box--success .step-block__loading-box__text,
	.step-block__loading-box:hover .step-block__loading-box__text {
		color: #111;
	}

	/* 로딩 박스 타이머 스타일 */
	.step-block__loading-box__time {
		font-variant-numeric: tabular-nums;
	}
	
	/* 로딩 박스 애니메이션 */
	.step-block__loading-box--loading span {
		--border-wide: 0.31rem;
		position: absolute;
		display: block;
		background: linear-gradient(var(--gradient-angle), transparent, var(--loading-box-color))
	}

	.step-block__loading-box--loading span:nth-child(1) {
		--gradient-angle: 90deg;
		top: 0;
		left: -100%;
		width: 100%;
		height: var(--border-wide);
		animation: animate-horizontal 2s linear infinite;
	}

	.step-block__loading-box--loading span:nth-child(2) {
		--gradient-angle: 180deg;
		top: -100%;
		right: 0;
		width: var(--border-wide);
		height: 100%;
		animation: animate-vertical 2s linear infinite 0.5s;
	}
	
	.step-block__loading-box--loading span:nth-child(3) {
		--gradient-angle: 270deg;
		bottom: 0;
		left: 100%;
		width: 100%;
		height: var(--border-wide);
		animation: animate-horizontal 2s linear infinite reverse;
	}
	
	.step-block__loading-box--loading span:nth-child(4) {
		--gradient-angle: 360deg;
		top: 100%;
		left: 0;
		width: var(--border-wide);
		height: 100%;
		animation: animate-vertical 2s linear infinite 0.5s reverse;
	}

	/* Animations */
	@keyframes typing {
		0%, 100% { width: 1rem; }
		45%, 55% { width: 100%; }
	}

	@keyframes animate-horizontal {
		from { left: -100%; }
		50%, to { left: 100%; }
	}

	@keyframes animate-vertical {
		from { top: -100%; }
		50%, to { top: 100%; }
	}
</style>
