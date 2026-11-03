import React, { createContext, useContext, useEffect, useState } from "react";

export type KeyboardMode = "virtual" | "physical";

interface KeyboardContextType {
	/** CURRENT MODE: 'VIRTUAL' (VIRTUAL KEYBOARD ALWAYS SHOWS ON INPUTS) OR 'PHYSICAL' (VIRTUAL KEYBOARD NEVER SHOWS) */
	keyboardMode: KeyboardMode;
	/** SET THE KEYBOARD MODE DIRECTLY */
	setKeyboardMode: (mode: KeyboardMode) => void;
	/** SWITCH BETWEEN 'VIRTUAL' AND 'PHYSICAL' */
	toggleKeyboardMode: () => void;
	/** HELPER BOOLEAN: TRUE WHEN VIRTUAL KEYBOARD MODE IS ACTIVE */
	isVirtualKeyboardEnabled: boolean;
}

const STORAGE_KEY = "micropos_keyboard_mode";

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
	const [keyboardMode, setKeyboardModeState] = useState<KeyboardMode>(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved === "virtual" || saved === "physical") {
				return saved;
			}
		} catch {
			// IGNORE LOCALSTORAGE ACCESS ERRORS
		}
		return "virtual";
	});

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, keyboardMode);
		} catch {
			// IGNORE LOCALSTORAGE ACCESS ERRORS
		}
	}, [keyboardMode]);

	const setKeyboardMode = (mode: KeyboardMode) => {
		setKeyboardModeState(mode);
	};

	const toggleKeyboardMode = () => {
		setKeyboardModeState((prev) => (prev === "virtual" ? "physical" : "virtual"));
	};

	return (
		<KeyboardContext.Provider
			value={{
				keyboardMode,
				setKeyboardMode,
				toggleKeyboardMode,
				isVirtualKeyboardEnabled: keyboardMode === "virtual",
			}}
		>
			{children}
		</KeyboardContext.Provider>
	);
}

export function useKeyboardMode(): KeyboardContextType {
	const context = useContext(KeyboardContext);
	if (!context) {
		throw new Error("useKeyboardMode debe utilizarse dentro de un KeyboardProvider");
	}
	return context;
}
