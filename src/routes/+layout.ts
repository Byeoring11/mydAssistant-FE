import type { LayoutLoad } from "./$types";

interface NavItem {
    path : string;
    label: string;
    tag  : string;
}

export const load: LayoutLoad = async () => {
    const navItems: NavItem[] = [
		// { path: '/deud', label: '대응답', tag: 'deud' },
		{ path: '/stub', label: '대응답', tag: 'stub' },
		{ path: '/bxm5', label: 'BXM5', tag: 'bxm5' },
		{ path: '/bxm4', label: 'BXM4', tag: 'bxm4' },
		{ path: '/diff', label: 'Diff', tag: 'diff' },
		{ path: '/utils', label: 'Utils', tag: 'utils' },
    ];

    return { navItems };
}

export const prerender = true;