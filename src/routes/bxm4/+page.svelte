
<script lang="ts">
	import ContainerTab from "$lib/components/ui/ContainerTab/ContainerTab.svelte";

    let activeTabId = $state('');
</script>

<svelte:head>
    <title>Mydata Assistant - BXM4</title>
    <meta name="description" content="BXM4 Helper" />
</svelte:head>

<ContainerTab bind:activeTabId={activeTabId} />
