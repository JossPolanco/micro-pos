import { PanelLeftClose, PanelLeftOpen, Pin, PinOff } from 'lucide';
import { Search, Bell, BellOff, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBreadcrumbs } from './navigationConfig';
import { useTranslation } from 'react-i18next';
import { MorphIcon } from 'morphicons/react';
import { useState, ReactNode } from 'react';
import { UserMenu } from '@/core/ui';
import NavTab from './NavTab';

interface NavigationBarsProps {
    children: ReactNode;
}

export default function NavigationBars({ children }: NavigationBarsProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, company } = useAuth();
    const { t } = useTranslation();

    const [isPinned, setIsPinned] = useState<boolean>(() => {
        try {
            return localStorage.getItem('sidebar_pinned') === 'true';
        } catch {
            return false;
        }
    });

    const [isOpen, setOpen] = useState<boolean>(() => {
        try {
            return localStorage.getItem('sidebar_pinned') === 'true';
        } catch {
            return false;
        }
    });

    const togglePin = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsPinned((prev) => {
            const next = !prev;
            try {
                localStorage.setItem('sidebar_pinned', String(next));
            } catch {
                // Ignore storage errors
            }
            if (next) {
                setOpen(true);
            }
            return next;
        });
    };

    return (
        <div className="drawer lg:drawer-open min-h-screen bg-base-300">
            <input
                id="my-drawer-4"
                type="checkbox"
                className="drawer-toggle"
                checked={isOpen}
                onChange={(e) => setOpen(e.target.checked)}
            />

            {/* CONTENIDO PRINCIPAL */}
            <div 
                className="drawer-content flex flex-col min-h-screen overflow-x-hidden"
                onClick={() => {
                    if (!isPinned && isOpen) {
                        setOpen(false);
                    }
                }}
            >
                {/* HEADER */}
                <header className="navbar w-full bg-base-100/90 backdrop-blur-md border-b border-base-200 sticky top-0 z-30 px-4 h-16 flex items-center justify-between shadow-xs">
                    {/* SIDEBAR + BREADCUM  */}
                    <div className="flex items-center gap-3">
                        <motion.button
                            type="button"
                            aria-label={isOpen ? "Colapsar barra lateral" : "Expandir barra lateral"}
                            className="btn btn-ghost btn-circle btn-sm"
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isPinned) {
                                    setIsPinned(false);
                                    try {
                                        localStorage.setItem('sidebar_pinned', 'false');
                                    } catch {
                                        // Ignore storage errors
                                    }
                                    setOpen(false);
                                } else {
                                    setOpen((prev) => !prev);
                                }
                            }}
                        >
                            <MorphIcon icon={isOpen ? PanelLeftClose : PanelLeftOpen} size={20} spring="snappy" className="text-base-content/80" />
                        </motion.button>

                        <div className="hidden sm:flex items-center">
                            <div className="breadcrumbs text-xs select-none">
                                <ul>
                                    {getBreadcrumbs(location.pathname).map((item, index, arr) => {
                                        const isLast = index === arr.length - 1;
                                        return (
                                            <li key={index}>
                                                {item.path && !isLast ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(item.path!)}
                                                        className="inline-flex items-center gap-1.5 opacity-70 hover:opacity-100 hover:text-primary transition-all cursor-pointer"
                                                    >
                                                        {item.icon}
                                                        <span>{t(item.label)}</span>
                                                    </button>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1.5 ${isLast ? 'font-semibold text-base-content' : 'opacity-70'}`}>
                                                        {item.icon}
                                                        <span>{t(item.label)}</span>
                                                    </span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* NOTIFICACIONES + MENÚ DE USUARIO */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* INPUT DE BÚSQUEDA */}
                        <div className="hidden md:flex items-end ml-2">
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm flex items-center gap-2 border border-base-200 text-xs text-base-content/60 font-normal rounded-xl bg-base-200/30 hover:bg-base-200/80 transition-all px-3 py-1.5"
                                onClick={() => alert(t("navbar.search_alert"))}
                            >
                                <Search size={14} className="text-base-content/50" />
                                <span>{t("navbar.search")}</span>
                                <kbd className="kbd kbd-xs bg-base-100 text-[10px] border border-base-200 px-1.5 ml-2 font-mono">
                                    <kbd className="kbd kbd-sm">ctrl</kbd>
                                    +
                                    <kbd className="kbd kbd-sm">K</kbd>
                                </kbd>
                            </button>
                        </div>
                        {/* NOTIFICACIONES */}
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm relative">
                                <Bell size={18} className="text-base-content/75" />
                            </div>
                            <div tabIndex={0} className="dropdown-content z-50 card card-compact w-72 p-3 shadow-xl bg-base-100 border border-base-200 text-base-content mt-3">
                                <div className="card-body">
                                    <div className="flex items-center justify-between border-b border-base-200 pb-2">
                                        <h4 className="font-bold text-sm">{t("navbar.notifications")}</h4>
                                        <span className="badge badge-ghost text-[10px] font-medium">{t("notifications.count", { count: 0 })}</span>
                                    </div>
                                    {/* ESTADO VACÍO (SIN NOTIFICACIONES) */}
                                    <div className="flex flex-col items-center justify-center py-6 text-center select-none">
                                        <div className="w-10 h-10 rounded-full bg-base-200/60 flex items-center justify-center mb-2 text-base-content/40">
                                            <BellOff size={20} />
                                        </div>
                                        <p className="font-semibold text-xs text-base-content/80">{t("navbar.empty_notifications")}</p>
                                        <p className="text-base-content/50 text-[11px] mt-0.5 max-w-45">
                                            {t("navbar.empty_notifications_desc")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-5 w-px bg-base-200 mx-0.5 hidden sm:block" />

                        {/* MENÚ DE USUARIO */}
                        <UserMenu />
                    </div>
                </header>

                {/* CONTENIDO PRINCIPAL */}
                <main className="flex-1 w-full p-4 lg:p-6">
                    {children}
                </main>
            </div>

            {/* SIDEBAR DRAWER */}
            <div className="drawer-side z-40">
                <label
                    htmlFor="my-drawer-4"
                    aria-label="Cerrar barra lateral"
                    className="drawer-overlay"
                ></label>
                <motion.aside 
                    onMouseEnter={() => {
                        if (!isPinned) setOpen(true);
                    }}
                    onMouseLeave={() => {
                        if (!isPinned) setOpen(false);
                    }}
                    onClick={() => {
                        if (!isOpen) setOpen(true);
                    }}
                    initial={false}
                    animate={{ width: isOpen ? 256 : 64 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.15 }}
                    className={`flex min-h-full flex-col bg-base-100 border-r border-base-200 shadow-xs overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none select-none ${!isOpen ? 'cursor-pointer hover:bg-base-200/30' : ''}`}
                >
                    {/* LOGO + NOMBRE DEL SISTEMA */}
                    <div className={`flex items-center justify-between border-b border-base-200 h-16 w-full ${!isOpen ? 'justify-center' : ''}`}>
                        <div
                            className="flex items-center gap-3 px-4 h-full cursor-pointer hover:bg-base-200/50 transition-colors select-none flex-1 overflow-hidden"
                            onClick={() => navigate('/home')}
                        >
                            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-primary to-emerald-400 text-primary-content flex items-center justify-center shrink-0 shadow-md">
                                <Sparkles size={20} />
                            </div>
                            <AnimatePresence mode="popLayout">
                                {isOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                                        className="flex flex-col whitespace-nowrap min-w-0"
                                    >
                                        <span className="text-base font-extrabold tracking-tight text-base-content leading-tight truncate max-w-36">{company.commercialName}</span>
                                        <span className="text-[10px] font-mono font-medium text-base-content/50 truncate max-w-36">{user?.role || company.mainCurrency}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {/* ACCIONES DEL HEADER: BOTÓN CERRAR (MOBILE) Y BOTÓN PIN (DESKTOP) */}
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center pr-3 shrink-0"
                                >
                                    {/* BOTÓN CERRAR SOLO EN MOBILE */}
                                    <div className="lg:hidden">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            type="button"
                                            className="btn btn-ghost btn-circle btn-sm text-base-content/70"
                                            onClick={() => setOpen(false)}
                                            aria-label="Cerrar menú"
                                        >
                                            <X size={20} />
                                        </motion.button>
                                    </div>

                                    {/* BOTÓN PIN SOLO EN DESKTOP */}
                                    <div 
                                        className="hidden lg:flex items-center tooltip tooltip-left" 
                                        data-tip={isPinned ? t("navbar.unpin_sidebar") : t("navbar.pin_sidebar")}
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.92 }}
                                            type="button"
                                            onClick={togglePin}
                                            aria-label={isPinned ? t("navbar.unpin_sidebar") : t("navbar.pin_sidebar")}
                                            className={`btn btn-circle btn-sm transition-all duration-300 relative group overflow-hidden ${
                                                isPinned
                                                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs hover:bg-primary/25 hover:border-primary/50'
                                                    : 'btn-ghost text-base-content/50 hover:text-base-content hover:bg-base-200/80 border border-transparent'
                                            }`}
                                        >
                                            <MorphIcon 
                                                icon={isPinned ? Pin : PinOff} 
                                                size={16} 
                                                spring="snappy" 
                                                className={`transition-colors duration-200 ${isPinned ? 'text-primary' : 'text-base-content/60 group-hover:text-base-content'}`} 
                                            />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* LISTA DEL MENU*/}
                    <NavTab isOpen={isOpen} />

                    {/* SIDEBAR FOOTER */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10, transition: { duration: 0.1 } }}
                                className="p-3 border-t border-base-200 overflow-hidden"
                            >
                                <div className="p-2.5 rounded-xl bg-base-200/50 flex items-center gap-3 border border-base-200/60 whitespace-nowrap">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                    <div className="text-[11px]">
                                        <p className="text-base-content/50">{t("navbar.version")}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.aside>
            </div>
        </div>
    );
}
