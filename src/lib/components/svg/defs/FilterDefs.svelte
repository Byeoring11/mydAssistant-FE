<script lang="ts">
    let { id = 'defaultFilter' } = $props();
</script>
  
<defs>
    <filter {id}>
        <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
        <feOffset dx="1" dy="1" />
        <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
        </feMerge>
    </filter>
</defs>