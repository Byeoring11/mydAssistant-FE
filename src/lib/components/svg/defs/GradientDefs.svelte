<script lang="ts">
    let { id = 'defaultGradient' } = $props();
</script>
  
<defs>
    <linearGradient {id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="var(--color-theme-1)" />
        <stop offset="100%" stop-color="var(--color-theme-2)" />
    </linearGradient>
</defs>

