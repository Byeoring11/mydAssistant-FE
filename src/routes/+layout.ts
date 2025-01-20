import type { LayoutLoad } from "./$types";
import type { NavItem } from "./layoutInterface"

export const load: LayoutLoad = async () => {
    const navItems: NavItem[] = [
		{ path: '/deud', label: '대응답', tag: 'deud' },
		{ path: '/bxm5', label: 'BXM5', tag: 'bxm5' },
		{ path: '/bxm4', label: 'BXM4', tag: 'bxm4' },
		{ path: '/diff', label: 'Diff', tag: 'diff' },
		{ path: '/utils', label: 'Utils', tag: 'utils' }
    ];

    return { navItems };
}