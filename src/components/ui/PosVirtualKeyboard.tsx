import Keyboard, { KeyboardReactInterface } from "react-simple-keyboard";
import { Delete, Hash, Keyboard as KeyboardIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import "react-simple-keyboard/build/css/index.css";

export type VirtualKeyboardType = "alphanumeric" | "numeric";

interface PosVirtualKeyboardProps {
	/** WHETHER THE KEYBOARD OVERLAY IS VISIBLE */
	isOpen: boolean;
	/** IDENTIFIER NAME OF THE ACTIVE INPUT (E.G. "USERNAME" OR "PASSWORD") */
	inputName: string;
	/** CURRENT VALUE OF THE ACTIVE INPUT */
	value: string;
	/** KEYBOARD TYPE TO SHOW: "ALPHANUMERIC" (TEXT + NUMBERS) OR "NUMERIC" (NUMBERS ONLY) */
	keyboardType: VirtualKeyboardType;
	/** DESCRIPTIVE LABEL OF ACTIVE FIELD TO SHOW ON TOP OF KEYBOARD */
	fieldLabel?: string;
	/** CALLBACK WHEN VALUE CHANGES FROM VIRTUAL KEYBOARD */
	onChange: (newValue: string) => void;
	/** CALLBACK WHEN PRESSING ENTER KEY */
	onEnter?: () => void;
	/** OPTIONAL CALLBACK TO CLOSE KEYBOARD MANUALLY */
	onClose?: () => void;
}

const ALPHANUMERIC_LAYOUT = {
	default: [
		"1 2 3 4 5 6 7 8 9 0 {bksp}",
		"q w e r t y u i o p",
		"a s d f g h j k l ñ",
		"{shift} z x c v b n m . _ -",
		"{clear} {space} {enter}",
	],
	shift: [
		"1 2 3 4 5 6 7 8 9 0 {bksp}",
		"Q W E R T Y U I O P",
		"A S D F G H J K L Ñ",
		"{shift} Z X C V B N M . _ -",
		"{clear} {space} {enter}",
	],
	numeric: ["1 2 3", "4 5 6", "7 8 9", "{clear} 0 {bksp}", "{enter}"],
};

const DISPLAY_LABELS: Record<string, string> = {
	"{bksp}": "⌫",
	"{enter}": "↵ Continuar",
	"{shift}": "⇧",
	"{space}": "Espacio",
	"{clear}": "Limpiar",
};

export default function PosVirtualKeyboard({
	isOpen,
	inputName,
	value,
	keyboardType,
	fieldLabel,
	onChange,
	onEnter,
	onClose,
}: PosVirtualKeyboardProps) {
	const keyboardRef = useRef<KeyboardReactInterface | null>(null);
	const [isShift, setIsShift] = useState(false);

	// CHOOSE ACTIVE SIMPLE-KEYBOARD LAYOUT BASED ON TYPE AND SHIFT STATE
	const activeLayoutName =
		keyboardType === "numeric" ? "numeric" : isShift ? "shift" : "default";

	// KEEP SIMPLE-KEYBOARD INTERNAL BUFFER IN SYNC WITH REACT STATE
	useEffect(() => {
		if (isOpen && keyboardRef.current) {
			keyboardRef.current.setInput(value, inputName);
		}
	}, [isOpen, value, inputName, activeLayoutName]);

	const handleChange = (input: string) => {
		if (keyboardType === "numeric") {
			const digitsOnly = input.replace(/\D/g, "");
			if (keyboardRef.current && digitsOnly !== input) {
				keyboardRef.current.setInput(digitsOnly, inputName);
			}
			onChange(digitsOnly);
		} else {
			onChange(input);
		}
	};

	const handleKeyPress = (button: string) => {
		if (button === "{shift}" || button === "{lock}") {
			setIsShift((prev) => !prev);
			return;
		}

		if (button === "{clear}") {
			if (keyboardRef.current) {
				keyboardRef.current.clearInput(inputName);
			}
			onChange("");
			return;
		}

		if (button === "{enter}") {
			onEnter?.();
			return;
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					key="pos-virtual-keyboard-overlay"
					initial={{ opacity: 0, y: 48, scale: 0.96 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 36, scale: 0.96 }}
					transition={{ type: "spring", stiffness: 380, damping: 30 }}
					className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-999 w-[94vw] select-none ${keyboardType === "numeric" ? "max-w-xs" : "max-w-2xl"}`}
					onMouseDown={(e) => {
						// PREVENT TOUCH OR CLICK ON KEYS FROM REMOVING FOCUS FROM INPUT
						e.preventDefault();
					}}
				>
					<motion.div
						layout
						transition={{ type: "spring", stiffness: 400, damping: 32 }}
						className="bg-base-200/95 backdrop-blur-xl border border-base-300 shadow-2xl rounded-3xl p-3"
					>
						{/* MINIMALIST VIRTUAL KEYBOARD HEADER BAR */}
						<div className="flex items-center justify-between pb-2 mb-2 border-b border-base-300/60 px-1.5">
							<div className="flex items-center gap-2">
								<span
									className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${keyboardType === "numeric"
										? "bg-secondary/15 text-secondary"
										: "bg-primary/15 text-primary"
										}`}
								>
									{keyboardType === "numeric" ? (
										<Hash className="w-3 h-3" />
									) : (
										<KeyboardIcon className="w-3 h-3" />
									)}
									<span>{fieldLabel || (keyboardType === "numeric" ? "PIN" : "Usuario")}</span>
								</span>
							</div>

							<div className="flex items-center gap-1">
								{value.length > 0 && (
									<button
										type="button"
										onClick={() => {
											if (keyboardRef.current) {
												keyboardRef.current.clearInput(inputName);
											}
											onChange("");
										}}
										className="btn btn-xs btn-ghost rounded-full gap-1 text-error/80 hover:text-error hover:bg-error/10 font-semibold"
										title="Vaciar campo"
									>
										<Delete className="w-3 h-3" />
										<span>Vaciar</span>
									</button>
								)}

								{onClose && (
									<button
										type="button"
										onClick={onClose}
										className="btn btn-xs btn-ghost btn-circle rounded-full text-base-content/60 hover:text-base-content"
										title="Cerrar teclado"
									>
										<X className="w-3.5 h-3.5" />
									</button>
								)}
							</div>
						</div>

						{/* SIMPLE-KEYBOARD CONTAINER */}
						<div
							className={`pos-keyboard-wrapper ${keyboardType === "numeric" ? "pos-keyboard-numeric" : ""
								}`}
						>
							<Keyboard
								keyboardRef={(r) => (keyboardRef.current = r)}
								inputName={inputName}
								layoutName={activeLayoutName}
								layout={ALPHANUMERIC_LAYOUT}
								display={DISPLAY_LABELS}
								onChange={handleChange}
								onKeyPress={handleKeyPress}
								theme="hg-theme-default hg-layout-default pos-simple-keyboard"
								buttonTheme={[
									{
										class: "pos-key-action",
										buttons: "{bksp} {shift}",
									},
									{
										class: "pos-key-clear",
										buttons: "{clear}",
									},
									{
										class: "pos-key-enter",
										buttons: "{enter}",
									},
								]}
							/>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
