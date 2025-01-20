<script lang='ts'>
	import { page } from '$app/state';


    import tabs from './tabs';

    let { activeTabId = $bindable('tab-0') }: { activeTabId: string } = $props();

    let path = $state(page.url.pathname.split('/')[1]);
    const labels: string[] = tabs.get(path)?.getLabels() || ['Home'];

    function tabChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if(target.checked) {
            activeTabId = target.id;
        }
    }    
</script>

<header>
    <div class="container__tabs">
        {#each labels as label, index}
            <div class="container__tabs__tab">
                <input
                    id="tab-{index}"
                    type="radio"
                    class="container__tabs__tab__input"
                    checked={index === 0}
                    name="tab"
                    onchange="{tabChange}"
                />
                <label for="tab-{index}" class="container__tabs__tab__label">{label}</label>
            </div>
        {/each}
    </div>
</header>

<style>
    .container__tabs {
        height: 100%;
        display: flex;
        flex-direction: row;
        gap: 1.5rem;
        border-bottom: 1px solid #444444;
    }

    .container__tabs__tab {
		height: 2.25rem;
        width: max-content;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        font-size: 1.1rem;
    }

    .container__tabs__tab__input {
        display: none;
    }

    .container__tabs__tab__label {
        width: max-content;
        position: relative;
        color: var(--color-text-3);
        transition: color 0.3s ease-in-out;
        cursor: pointer;
    }

    .container__tabs__tab__label::before {
        content: '';
        position: absolute;
		width: 100%;
		height: 100%;
        top: -30%;
        border-top: 2px solid #2c2c2c;
        transition: border-top 0.3s ease-in-out;
    }
    
    .container__tabs__tab__input:hover + .container__tabs__tab__label,
    .container__tabs__tab__input:checked + .container__tabs__tab__label {
        color: var(--color-text-1);
        transition: color 0.3s ease-in-out;
    }

    .container__tabs__tab__input:hover + .container__tabs__tab__label::before,
    .container__tabs__tab__input:checked + .container__tabs__tab__label::before {
        border-top: 2px solid #ffffff;
        transition: border-top 0.3s ease-in-out;
    }
</style>