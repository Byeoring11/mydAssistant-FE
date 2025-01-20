<script lang="ts">
	import ContainerTab from "$lib/components/ui/ContainerTab/ContainerTab.svelte";

    let activeTabId = $state('');
</script>

<svelte:head>
    <title>Mydata Assistant - BXM5</title>
	<meta name="description" content="BXM5 Helper" />
</svelte:head>

<ContainerTab bind:activeTabId={activeTabId} />
