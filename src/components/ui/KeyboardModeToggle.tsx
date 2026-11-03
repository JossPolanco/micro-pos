import { useKeyboardMode } from "../../context/KeyboardContext";
import { Keyboard, KeyboardOff } from "lucide-react";
import { motion } from "motion/react";

interface KeyboardModeToggleProps {
	/** IF TRUE (DEFAULT), FIXES TO THE BOTTOM LEFT CORNER OF THE SCREEN */
	fixed?: boolean;
	/** ADDITIONAL CSS CLASSES TO CUSTOMIZE THE CONTAINER */
	className?: string;
}

/**
 * REUSABLE MINIMALIST BUTTON TO SWITCH BETWEEN VIRTUAL AND PHYSICAL KEYBOARD MODES
 */
export default function KeyboardModeToggle({
	fixed = true,
	className = "",
}: KeyboardModeToggleProps) {
	const { keyboardMode, setKeyboardMode } = useKeyboardMode();
	const isVirtual = keyboardMode === "virtual";

	const positionClasses = fixed ? "fixed bottom-5 left-5 z-[1000]" : "";

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: "easeOut" }}
			className={`${positionClasses} select-none ${className}`}
			onMouseDown={(e) => {
				// PREVENT LOSING FOCUS FROM ACTIVE INPUT WHEN CLICKING WITH MOUSE OR TOUCH
				e.preventDefault();
			}}
		>
			<div className="bg-base-200/90 backdrop-blur-md border border-base-300 shadow-md rounded-full p-1 flex items-center gap-1">
				{/* OPTION 1: ALWAYS VIRTUAL KEYBOARD */}
				<button
					type="button"
					onClick={() => setKeyboardMode("virtual")}
					className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${isVirtual
							? "text-primary-content"
							: "text-base-content/60 hover:text-base-content"
						}`}
					title="Siempre mostrar teclado virtual en cualquier input"
				>
					{isVirtual && (
						<motion.div
							layoutId="keyboard-mode-pill"
							transition={{ type: "spring", stiffness: 420, damping: 32 }}
							className="absolute inset-0 bg-primary rounded-full shadow-xs"
						/>
					)}
					<Keyboard className="w-4 h-4 relative z-10" />
					<span className="relative z-10">Virtual</span>
				</button>

				{/* OPTION 2: ALWAYS PHYSICAL KEYBOARD */}
				<button
					type="button"
					onClick={() => setKeyboardMode("physical")}
					className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${!isVirtual
							? "text-neutral-content"
							: "text-base-content/60 hover:text-base-content"
						}`}
					title="Siempre usar teclado físico (nunca abrir teclado virtual)"
				>
					{!isVirtual && (
						<motion.div
							layoutId="keyboard-mode-pill"
							transition={{ type: "spring", stiffness: 420, damping: 32 }}
							className="absolute inset-0 bg-neutral rounded-full shadow-xs"
						/>
					)}
					<KeyboardOff className="w-4 h-4 relative z-10" />
					<span className="relative z-10">Físico</span>
				</button>
			</div>
		</motion.div>
	);
}
