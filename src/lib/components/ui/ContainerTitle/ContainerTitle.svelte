<script lang='ts'>
    import { page } from '$app/state';
    import pathInfo from './pathInfo';
    
    function getPathList(currentPath: string): string[] {
        const segments: string[] = currentPath.split('/').filter(Boolean);
        return segments.map((_, index) => 
            '/' + segments.slice(0, index + 1).join('/')
        );
    }

    const currentPath: string = $derived(page.url.pathname);
    const pathList: string[] = $derived(getPathList(currentPath));
</script>

<header class='underline'>
    <div class='title'>{pathInfo.getLabelByPath(currentPath)}</div>
    {#if pathList.length > 1}
        <div class="path">
            {#each pathList as path, index}
                <a href={path}>{pathInfo.getLabelByPath(path)}</a>
                {#if index + 1 !== pathList.length}
                    <p>&nbsp&gt&nbsp</p>
                {/if}
            {/each}
        </div>
    {/if}
</header>

<style>
    header {
        display: flex;
        flex-direction: row;
        align-items: baseline;
    }

    .path {
        display: flex;
        flex-direction: row;
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text-2);
        margin-left: 1rem;
    }
</style>