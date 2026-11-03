import { House, UserStar, Users, Shield, Settings, BugPlay, LucideProps } from 'lucide-react';
import React from 'react';

// --- INTERFACES Y TIPOS DE LA CONFIGURACIÓN DE NAVEGACIÓN ---
export interface NavItem {
    id: string;
    label: string;
    path?: string;
    icon: React.ComponentType<LucideProps>;
    dataTip?: string;
    children?: NavSubItem[];
    roles?: string[];
}

export interface NavSubItem {
    id: string;
    label: string;
    path: string;
    icon: React.ComponentType<LucideProps>;
    roles?: string[];
}

export interface NavSection {
    id: string;
    title: string;
    items: NavItem[];
    roles?: string[];
}

export interface BreadcrumbItem {
    label: string;
    icon?: React.ReactNode;
    path?: string;
}

// --- FUENTE ÚNICA DE VERDAD: ESTRUCTURA PRINCIPAL DE SECCIONES Y RUTAS DEL SISTEMA ---
export const NAVIGATION_SECTIONS: NavSection[] = [
    {
        id: 'main',
        title: 'nav.main',
        items: [
            {
                id: 'home',
                label: 'nav.home',
                path: '/home',
                icon: House,
                dataTip: 'nav.home'
            }
        ]
    },
    {
        id: 'management',
        title: 'nav.management',
        roles: ['Admin', 'Dev'],
        items: [
            {
                id: 'admin',
                label: 'nav.admin',
                icon: UserStar,
                dataTip: 'nav.admin',
                children: [
                    {
                        id: 'users',
                        label: 'nav.users',
                        path: '/users',
                        icon: Users
                    },
                    {
                        id: 'roles',
                        label: 'nav.roles',
                        path: '/roles',
                        icon: Shield
                    }
                ]
            }
        ]
    },
    {
        id: 'system',
        title: 'nav.system',
        items: [
            {
                id: 'settings',
                label: 'nav.settings',
                path: '/settings',
                icon: Settings,
                dataTip: 'nav.settings'
            },
            {
                id: 'testing',
                label: 'nav.testing',
                path: '/testing',
                icon: BugPlay,
                dataTip: 'nav.testing',
                roles: ['Dev']
            }
        ]
    }
];

// --- FUNCIÓN HELPER: GENERADOR DINÁMICO DE BREADCRUMBS BASADO EN LA RUTA ACTUAL ---
export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
    const HomeIcon = House;

    for (const section of NAVIGATION_SECTIONS) {
        for (const item of section.items) {
            const ItemIcon = item.icon;

            // COINCIDENCIA DIRECTA DE RUTA (EJ. /home, /settings, /testing)
            if (item.path === pathname) {
                if (item.path === '/home') {
                    return [{ label: 'nav.breadcrumb.home', icon: <HomeIcon size={14} /> }];
                }
                const formattedSectionTitle = section.title
                return [
                    { label: 'nav.breadcrumb.home', icon: <HomeIcon size={14} />, path: '/home' },
                    { label: formattedSectionTitle },
                    { label: item.label, icon: <ItemIcon size={14} /> }
                ];
            }

            // COINCIDENCIA EN SUBELEMENTOS / HIJOS (EJ. /users, /roles)
            if (item.children) {
                for (const subItem of item.children) {
                    if (subItem.path === pathname) {
                        const SubItemIcon = subItem.icon;
                        return [
                            { label: 'nav.breadcrumb.home', icon: <HomeIcon size={14} />, path: '/home' },
                            { label: item.label, icon: <ItemIcon size={14} /> },
                            { label: subItem.label, icon: <SubItemIcon size={14} /> }
                        ];
                    }
                }
            }
        }
    }

    // RUTA POR DEFECTO / FALLBACK
    return [
        { label: 'nav.breadcrumb.home', icon: <HomeIcon size={14} />, path: '/home' },
        { label: 'nav.breadcrumb.default' }
    ];
}

