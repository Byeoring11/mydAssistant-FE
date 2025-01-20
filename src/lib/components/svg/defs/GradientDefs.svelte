<script lang="ts">
    let { id = 'defaultGradient' } = $props();
</script>
  
<defs>
    <linearGradient {id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="var(--color-primary-1)" />
        <stop offset="100%" stop-color="var(--color-primary-2)" />
    </linearGradient>
</defs>

<defs>
    <linearGradient id="blackToWhite" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="black" />
        <stop offset="100%" stop-color="gray" />
    </linearGradient>
</defs>
