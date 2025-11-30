<script lang="ts">
	import ContainerTab from "$lib/components/ui/ContainerTab/ContainerTab.svelte";
	import GenDatTab from "./dat/GenDatTab.svelte";
	import GenSourceTab from "./gen-source/GenSourceTab.svelte";
	import ServiceInfTab from "./service-inf/ServiceInfTab.svelte";

    let activeTabId = $state('tab-0');
</script>

<svelte:head>
    <title>Mydata Assistant - BXM5</title>
	<meta name="description" content="BXM5 Helper" />
</svelte:head>

<ContainerTab bind:activeTabId={activeTabId} />

<main class="container__main">
    <!-- 거래파라미터 등록 탭 -->
	<div id="content-0" class="tab-content-container" class:hidden={activeTabId !== 'tab-0'}>
        <GenDatTab />
	</div>

    <!-- 소스 프레임 생성 탭 -->
	<div id="content-1" class="tab-content-container" class:hidden={activeTabId !== 'tab-1'}>
        <GenSourceTab />
	</div>
    
    <!-- SERVICE_INF 예시 탭 -->
     <div id="content-2" class="tab-content-container" class:hidden={activeTabId !== 'tab-2'}>
        <ServiceInfTab />
	</div>
</main>

<style>
	.container__main {
		margin-top: 1rem;
		height: 100%;
	}

    .tab-content-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
	}

	.tab-content-container.hidden {
		display: none;
	}
</style>