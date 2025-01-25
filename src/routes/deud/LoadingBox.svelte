<script lang="ts">
	import { onMount } from 'svelte';

	let { serverType, state }: { serverType: number, state: number } = $props();
    
    const Server: Record<string, number> = {
		wdexpa1p: 1,
		edwap1t: 2,
		mypap1d: 3
	};

	const State: Record<string, number> = {
		pending: 1,
		loading: 2,
		success: 3,
		error: 9
	}
	
    const loadingBoxColor = ['#03e9f4', '#f355f4', '#ecb214'];
    
    onMount(() => {
		const h2Element: HTMLElement = document.querySelector(`#loading-box-${serverType}`) as HTMLElement;
		h2Element.style.setProperty('--loading-box-color', loadingBoxColor[serverType - 1]);

		const timerElement: HTMLElement = document.querySelector('#timer') as HTMLElement;
		const innerTimerElement: HTMLElement = document.querySelector(`#${serverName}`) as HTMLElement;
	});

	const serverName = Object.keys(Server).find((key) => Server[key] === serverType);
	const currentState = $derived(Object.keys(State).find((key) => State[key] === state));
</script>

<div id="loading-box-{serverType}" class="step-block__loading-box step-block__loading-box--{currentState}">
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
	<div id={serverName}>00:00</div>
</div>

<style>
	.step-block__loading-box {
        position: relative;
		max-width: 20rem;
        max-height: calc(20vh);
		width: 27%;
		aspect-ratio: 1/1;
		background: rgba(26, 26, 31, 0.685);
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		transition: 0.5s;
		overflow: hidden;
		border-radius: 1rem;
		-webkit-box-reflect: below 1px linear-gradient(transparent, #0004);
	}

	.step-block__loading-box--error {
		border: 1px solid red;
	}

	.step-block__loading-box:not(:last-child) {
		margin-right: 9%;
	}

	.step-block__loading-box--success,
	.step-block__loading-box:hover {
		background: var(--loading-box-color);
		color: #050801;
		box-shadow:
			0 0 5px var(--loading-box-color),
			0 0 25px var(--loading-box-color),
			0 0 50px var(--loading-box-color),
			0 0 75px var(--loading-box-color);
	}

	.step-block__loading-box h2 {
		color: var(--loading-box-color);
		overflow: hidden;
		letter-spacing: 0.125rem;
		text-align: center;
		transition: 0.5s;
	}

	.step-block__loading-box--error h2 {
		color: red;
	}

	.step-block__loading-box--loading h2 {
		animation: typing 5s infinite;
	}

	.step-block__loading-box--success h2,
	.step-block__loading-box:hover h2 {
		color: #111;
	}

	@keyframes typing {
		0%,
		100% {
			width: 1rem;
		}
		45%, 55% {
			width: 100%;
		}
	}

	
	.step-block__loading-box--loading span {
		position: absolute;
		display: block;
	}

	.step-block__loading-box--loading span:nth-child(1) {
		top: 0;
		left: -100%;
		width: 100%;
		height: 0.31rem;
		background: linear-gradient(90deg, transparent, var(--loading-box-color));
		animation: animate1 2s linear infinite;
		animation-delay: 0s;
	}

	@keyframes animate1 {
		0% {
			left: -100%;
		}

		50%,
		100% {
			left: 100%;
		}
	}
	
	.step-block__loading-box--loading span:nth-child(3) {
		bottom: 0;
		right: -100%;
		width: 100%;
		height: 0.31rem;
		background: linear-gradient(270deg, transparent, var(--loading-box-color));
		animation: animate2 2s linear infinite;
		animation-delay: 1s;
	}
	@keyframes animate2 {
		0% {
			right: -100%;
		}

		50%,
		100% {
			right: 100%;
		}
	}
	.step-block__loading-box--loading span:nth-child(2) {
		top: -100%;
		right: 0;
		width: 0.31rem;
		height: 100%;
		background: linear-gradient(180deg, transparent, var(--loading-box-color));
		animation: animate3 2s linear infinite;
		animation-delay: 0.5s;
	}
	@keyframes animate3 {
		0% {
			top: -100%;
		}

		50%,
		100% {
			top: 100%;
		}
	}
	.step-block__loading-box--loading span:nth-child(4) {
		bottom: -100%;
		left: 0;
		width: 0.31rem;
		height: 100%;
		background: linear-gradient(360deg, transparent, var(--loading-box-color));
		animation: animate4 2s linear infinite;
		animation-delay: 1.5s;
	}
	@keyframes animate4 {
		0% {
			bottom: -100%;
		}

		50%,
		100% {
			bottom: 100%;
		}
	}
</style>
