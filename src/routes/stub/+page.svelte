<script lang="ts">
	import ContainerTab from '$lib/components/ui/ContainerTab/ContainerTab.svelte';
	import StubLoadTab from './load/StubLoadTab.svelte';

	let activeTabId = $state('tab-0');
</script>

<svelte:head>
	<title>Mydata Assistant - 대응답 적재</title>
	<meta name="description" content="대응답 적재 자동화" />
</svelte:head>

<ContainerTab bind:activeTabId={activeTabId} />

<main class="container__main">
	<div id="content-0" class="stub-container" class:hidden={activeTabId !== 'tab-0'}>
		<StubLoadTab />
	</div>
	<div id="content-1" class="stub-container" class:hidden={activeTabId !== 'tab-1'}>

	</div>
</main>

<style>
	.container__main {
		margin-top: 1rem;
		height: 100%;
		overflow: auto;
	}

	.stub-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.stub-container.hidden {
		display: none;
	}
</style>
