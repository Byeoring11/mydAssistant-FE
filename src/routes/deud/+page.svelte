<script lang="ts">
	import ContainerTab from '$lib/components/ui/ContainerTab/ContainerTab.svelte';
	import DeudTab0 from './DeudTab0.svelte';

	let activeTabId = $state('tab-0');
</script>

<svelte:head>
	<title>Mydata Assistant - 대응답 적재</title>
	<meta name="description" content="대응답 적재 자동화" />
</svelte:head>

<ContainerTab bind:activeTabId={activeTabId} />

<main class="container__main">
	<div id="content-0" class="deud-container" class:hidden={activeTabId !== 'tab-0'}>
		<DeudTab0 />
	</div>
	<div id="content-1" class="deud-container" class:hidden={activeTabId !== 'tab-1'}>
		<div class="deud-block">
			<div class="launch-block">
				<button class="launch-block__button" onclick={() => {console.log('launch')}}>
					<span class="launch-block__button__text">대응답 Launch!</span>
				</button>
			</div>
		</div>
	</div>
</main>

<style>
	.container__main {
		margin-top: 1rem;
		height: 100%;
	}

	.deud-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.deud-container.hidden {
		display: none;
	}
</style>
