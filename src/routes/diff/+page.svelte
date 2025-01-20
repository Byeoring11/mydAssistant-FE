<script lang="ts">
	import ContainerTab from "$lib/components/ui/ContainerTab/ContainerTab.svelte";

    let activeTabId = $state('');
</script>

<svelte:head>
    <title>Mydata Assistant - Diff</title>
	<meta name="description" content="Diff Check Tool for deployments" />
</svelte:head>

<ContainerTab bind:activeTabId={activeTabId} />
