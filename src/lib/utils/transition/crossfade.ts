import { quintOut } from 'svelte/easing';
import { crossfade } from 'svelte/transition';

const [send, receive] = crossfade({
    fallback(node) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;

        return {
            duration: 350,
            easing: quintOut,
            css: (t) => `
                transform: ${transform} scale(${t});
                opacity: ${t}
            `
        };
    }
});

export { send, receive };