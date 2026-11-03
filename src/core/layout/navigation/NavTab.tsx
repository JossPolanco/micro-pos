import { NAVIGATION_SECTIONS, NavItem, NavSection } from './navigationConfig';
import { useAuth } from '@/features/auth/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide';
import { useTranslation } from 'react-i18next';
import { MorphIcon } from 'morphicons/react';
import { useState, useMemo } from 'react';

interface NavTabProps {
	isOpen?: boolean;
}

export default function NavTab({ isOpen = true }: NavTabProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();

	// --- ESTADO PARA CONTROLAR QUÉ SUBMENÚS ACORDEÓN ESTÁN EXPANDIDOS EN EL SIDEBAR ---
	const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

	// --- FUNCIÓN HELPER PARA VERIFICAR SI UNA RUTA ES LA QUE ESTÁ ACTIVA ACTUALMENTE ---
	const isActive = (path?: string) => !!path && location.pathname === path;

	// --- FUNCIÓN PARA ALTERNAR EL ESTADO EXPANDIDO/COLAPSADO DE UN SUBMENÚ ACORDEÓN ---
	const toggleAccordion = (id: string) => {
		setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const { user } = useAuth();

	// --- FILTRADO DINÁMICO DE NAVEGACIÓN BASADO EN ROLES ---
	const allowedSections = useMemo(() => {
		// Si no hay roles definidos, todos entran. Si hay, el usuario debe tener uno.
		const hasAccess = (roles?: string[]) => !roles || roles.includes(user?.role || '');

		return NAVIGATION_SECTIONS
			.filter(section => hasAccess(section.roles))
			.map(section => ({
				...section,
				items: section.items
					.filter(item => hasAccess(item.roles))
					.map(item => ({
						...item,
						children: item.children ? item.children.filter(child => hasAccess(child.roles)) : undefined
					}))
					// Si un ítem tenía hijos definidos originalmente, pero todos fueron filtrados por falta de permisos, ocultar el ítem padre
					.filter(item => !(item.children && item.children.length === 0))
			}))
			// Ocultar sección completa si no le quedó ningún ítem
			.filter(section => section.items.length > 0);
	}, [user?.role]);

	return (
		<div className="w-full grow px-2 py-3 space-y-4 select-none">
			{/* RECORRIDO DE LAS SECCIONES DE NAVEGACIÓN (EJ. PRINCIPAL, ADMINISTRACIÓN, SISTEMA) */}
			{allowedSections.map((section: NavSection) => (
				<div key={section.id}>
					{/* TÍTULO DE LA SECCIÓN (SOLO VISIBLE CUANDO EL SIDEBAR ESTÁ EXPANDIDO/DESPLEGADO) */}
					<AnimatePresence mode="popLayout">
						{isOpen && (
							<motion.div
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
								className="px-3 mb-1.5 text-[11px] font-bold tracking-wider text-base-content/40 uppercase whitespace-nowrap"
							>
								{t(section.title)}
							</motion.div>
						)}
					</AnimatePresence>
					<ul className="space-y-1">
						{section.items.map((item: NavItem) => {
							const ItemIcon = item.icon;

							// --- ELEMENTO PADRE CON SUBMENÚS DESPLEGABLES (EJ. ADMINISTRACIÓN -> USUARIOS, ROLES) ---
							if (item.children) {
								const isAccordionOpen = !!openAccordions[item.id];
								return (
									<li key={item.id} className="relative">
										<AnimatePresence mode="popLayout" initial={false}>
											{isOpen ? (
												/* MODALIDAD CON SIDEBAR ABIERTO: ACORDEÓN COMPLETO CON ICONO MORPH Y SUBELEMENTOS */
												<motion.div
													key="open"
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
													exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
													className="w-full"
												>
													<motion.button
														type="button"
														whileTap={{ scale: 0.97 }}
														onClick={() => toggleAccordion(item.id)}
														className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm text-base-content/75 hover:bg-base-200/80 hover:text-base-content transition-colors duration-200"
													>
														<div className="flex items-center gap-3 whitespace-nowrap overflow-hidden">
															<ItemIcon size={20} className="text-base-content/60 shrink-0" />
															<span className="truncate">{t(item.label)}</span>
														</div>
														<MorphIcon icon={isAccordionOpen ? ChevronDown : ChevronRight} size={16} spring="snappy" className="text-base-content/50 shrink-0" />
													</motion.button>

													{/* LISTA DE SUBELEMENTOS / RUTAS HIJAS SI EL ACORDEÓN ESTÁ EXPANDIDO */}
													<AnimatePresence>
														{isAccordionOpen && (
															<motion.ul
																initial="hidden"
																animate="visible"
																exit="hidden"
																variants={{
																	visible: {
																		height: 'auto',
																		marginTop: '0.25rem', // mt-1
																		opacity: 1,
																		transition: {
																			height: { duration: 0.3, ease: 'easeOut' },
																			marginTop: { duration: 0.3, ease: 'easeOut' },
																			staggerChildren: 0.04
																		}
																	},
																	hidden: {
																		height: 0,
																		marginTop: 0,
																		opacity: 0,
																		transition: {
																			height: { duration: 0.3, ease: 'easeInOut' },
																			marginTop: { duration: 0.3, ease: 'easeInOut' },
																			opacity: { duration: 0.2 }
																		}
																	}
																}}
																className="ml-4 pl-3 border-l border-base-200 space-y-1 overflow-hidden"
															>
																{item.children.map((subItem) => {
																	const SubIcon = subItem.icon;
																	return (
																		<motion.li
																			key={subItem.id}
																			variants={{
																				hidden: { opacity: 0, x: -10 },
																				visible: { opacity: 1, x: 0 }
																			}}
																		>
																			<motion.button
																				type="button"
																				whileTap={{ scale: 0.97 }}
																				onClick={() => navigate(subItem.path)}
																				className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 whitespace-nowrap overflow-hidden ${isActive(subItem.path)
																					? 'bg-primary/15 text-primary font-semibold'
																					: 'text-base-content/70 hover:bg-base-200/60 hover:text-base-content'
																					}`}
																			>
																				<SubIcon size={16} className="shrink-0" />
																				<span className="truncate">{t(subItem.label)}</span>
																			</motion.button>
																		</motion.li>
																	);
																})}
															</motion.ul>
														)}
													</AnimatePresence>
												</motion.div>
											) : (
												/* MODALIDAD CON SIDEBAR COLAPSADO: BOTÓN CENTRADO SOLO CON ICONO Y TOOLTIP FLOTANTE */
												<motion.button
													key="closed"
													initial={{ opacity: 0, scale: 0.8 }}
													animate={{ opacity: 1, scale: 1 }}
													exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
													whileTap={{ scale: 0.95 }}
													type="button"
													onClick={() => toggleAccordion(item.id)}
													data-tip={t(item.label)}
													className="w-full flex items-center justify-center p-2.5 rounded-xl text-base-content/75 hover:bg-base-200/80 hover:text-base-content transition-colors duration-200 tooltip tooltip-right"
												>
													<ItemIcon size={20} className="text-base-content/60 shrink-0" />
												</motion.button>
											)}
										</AnimatePresence>
									</li>
								);
							}

							// --- ELEMENTO INDIVIDUAL SIMPLE SIN HIJOS (EJ. INICIO, CONFIGURACIÓN, PRUEBAS / DEBUG) ---
							return (
								<li key={item.id} className="relative">
									<AnimatePresence mode="popLayout" initial={false}>
										{isOpen ? (
											<motion.button
												key="open-simple"
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
												whileTap={{ scale: 0.97 }}
												type="button"
												onClick={() => item.path && navigate(item.path)}
												className={`w-full flex items-center gap-3 px-3 justify-start py-2.5 rounded-xl font-medium text-sm transition-colors duration-200 whitespace-nowrap overflow-hidden ${isActive(item.path)
													? 'bg-primary/15 text-primary font-semibold shadow-xs'
													: 'text-base-content/75 hover:bg-base-200/80 hover:text-base-content'
													}`}
											>
												<ItemIcon size={20} className={`shrink-0 ${isActive(item.path) ? 'text-primary' : 'text-base-content/60'}`} />
												<span className="truncate">{t(item.label)}</span>
											</motion.button>
										) : (
											<motion.button
												key="closed-simple"
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
												whileTap={{ scale: 0.95 }}
												type="button"
												onClick={() => item.path && navigate(item.path)}
												data-tip={t(item.label)}
												className={`w-full flex items-center justify-center p-2.5 rounded-xl font-medium text-sm transition-colors duration-200 tooltip tooltip-right ${isActive(item.path)
													? 'bg-primary/15 text-primary font-semibold shadow-xs'
													: 'text-base-content/75 hover:bg-base-200/80 hover:text-base-content'
													}`}
											>
												<ItemIcon size={20} className={`shrink-0 ${isActive(item.path) ? 'text-primary' : 'text-base-content/60'}`} />
											</motion.button>
										)}
									</AnimatePresence>
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</div>
	);
}

