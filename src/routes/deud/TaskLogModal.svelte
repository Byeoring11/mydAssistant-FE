<script lang="ts">
    import { fade } from "svelte/transition";

    let show: boolean = $props();

    function closeModal() {
        show = false;
    }
</script>

