import { Activity, CheckCircle2, Eye, EyeOff, Hash, LogIn, ShieldAlert, Sparkles, Store, User, X, } from "lucide-react";
import KeyboardModeToggle from "../../components/ui/KeyboardModeToggle";
import PosVirtualKeyboard from "../../components/ui/PosVirtualKeyboard";
import { useKeyboardMode } from "../../context/KeyboardContext";
import { AnimatePresence, motion } from "motion/react";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type ActiveField = "username" | "password" | null;

export default function LoginPage() {
	const navigate = useNavigate();
	const { isVirtualKeyboardEnabled } = useKeyboardMode();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [activeField, setActiveField] = useState<ActiveField>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [loginSuccessUser, setLoginSuccessUser] = useState<string | null>(null);

	const usernameInputRef = useRef<HTMLInputElement | null>(null);
	const passwordInputRef = useRef<HTMLInputElement | null>(null);

	// UPDATE VALUE FOR THE CURRENT ACTIVE FIELD FROM VIRTUAL KEYBOARD
	const handleVirtualKeyboardChange = (newValue: string) => {
		setErrorMsg(null);
		if (activeField === "username") {
			setUsername(newValue.trimStart());
		} else if (activeField === "password") {
			const onlyNumbers = newValue.replace(/\D/g, "");
			setPassword(onlyNumbers);
		}
	};

	// HANDLE ENTER KEY PRESS FROM VIRTUAL KEYBOARD
	const handleVirtualKeyboardEnter = () => {
		if (activeField === "username") {
			setActiveField("password");
			passwordInputRef.current?.focus();
		} else if (activeField === "password") {
			handleLoginSubmit();
		}
	};

	const handleLoginSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		setErrorMsg(null);

		const cleanUser = username.trim();
		const cleanPin = password.trim();

		if (!cleanUser) {
			setErrorMsg("Ingresa tu usuario (ej. pepito23)");
			setActiveField("username");
			usernameInputRef.current?.focus();
			return;
		}

		if (!cleanPin || !/^\d+$/.test(cleanPin)) {
			setErrorMsg("El PIN debe contener solo números (ej. 58463)");
			setActiveField("password");
			passwordInputRef.current?.focus();
			return;
		}

		if (cleanPin.length < 4) {
			setErrorMsg("El PIN debe tener al menos 4 dígitos");
			setActiveField("password");
			passwordInputRef.current?.focus();
			return;
		}

		// FRONTEND SIMULATION ONLY (NO BACKEND YET)
		setActiveField(null);
		setLoginSuccessUser(cleanUser);
		setTimeout(() => {
			navigate("/home", { state: { username: cleanUser } });
		}, 550);
	};

	const fillDemoCredentials = () => {
		setErrorMsg(null);
		setUsername("pepito23");
		setPassword("58463");
	};

	const showVirtualKeyboard = isVirtualKeyboardEnabled && activeField !== null;

	return (
		<div
			className="min-h-screen bg-base-100 text-base-content relative flex items-center justify-center p-4 select-none overflow-hidden"
			onClick={() => {
				// CLOSE VIRTUAL KEYBOARD WHEN CLICKING OUTSIDE THE CARD
				setActiveField(null);
			}}
		>
			{/* SUBTLE TOP RIGHT BUTTON FOR SYSTEM HEALTH MONITOR */}
			<motion.button
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				whileHover={{ scale: 1.03 }}
				whileTap={{ scale: 0.96 }}
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					navigate("/health");
				}}
				className="fixed top-5 right-5 z-40 bg-base-200/90 backdrop-blur-md hover:bg-base-200 border border-base-300 shadow-xs rounded-full px-3.5 py-2 flex items-center gap-2 text-xs font-bold text-base-content/75 hover:text-base-content transition-colors cursor-pointer"
			>
				<Activity className="w-3.5 h-3.5 text-primary" />
				<span>Salud del Sistema</span>
			</motion.button>

			{/* CENTERED MINIMALIST LOGIN CARD */}
			<motion.main
				initial={{ opacity: 0, y: 16, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				onClick={(e) => e.stopPropagation()}
				className="w-full max-w-sm bg-base-200 rounded-3xl p-7 border border-base-300/80 shadow-sm space-y-6"
			>
				{/* MINIMALIST BRAND HEADER */}
				<div className="text-center space-y-2">
					<motion.div
						initial={{ scale: 0.85, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.08, type: "spring", stiffness: 350, damping: 24 }}
						className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto"
					>
						<Store className="w-6 h-6" />
					</motion.div>
					<div>
						<h1 className="text-xl font-black tracking-tight">Micro-POS</h1>
						<p className="text-xs text-base-content/55 mt-0.5">
							Acceso rápido de cajero
						</p>
					</div>
				</div>

				<form onSubmit={handleLoginSubmit} className="space-y-4">
					{/* FIELD 1: USERNAME (NORMAL TEXT AND NUMBERS) */}
					<div className="space-y-1.5">
						<label
							htmlFor="pos-username"
							className="text-xs font-bold text-base-content/70 flex items-center gap-1.5 px-1"
						>
							<User className="w-3.5 h-3.5 text-primary" />
							<span>Usuario</span>
						</label>

						<div
							onClick={() => {
								setActiveField("username");
								usernameInputRef.current?.focus();
							}}
							className={`flex items-center bg-base-100 rounded-2xl border px-3.5 transition-all cursor-text ${activeField === "username"
								? "border-primary ring-3 ring-primary/15"
								: "border-base-300/90 hover:border-base-content/25"
								}`}
						>
							<input
								ref={usernameInputRef}
								id="pos-username"
								type="text"
								autoComplete="off"
								value={username}
								onFocus={() => setActiveField("username")}
								onChange={(e) => {
									setErrorMsg(null);
									setUsername(e.target.value);
								}}
								placeholder="pepito23"
								className="w-full bg-transparent py-2.5 text-sm font-bold focus:outline-none placeholder:font-normal placeholder:opacity-40"
							/>
							{username && (
								<button
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={(e) => {
										e.stopPropagation();
										setUsername("");
										setActiveField("username");
										usernameInputRef.current?.focus();
									}}
									className="p-1 rounded-full text-base-content/40 hover:text-error transition-colors cursor-pointer"
									title="Limpiar usuario"
								>
									<X className="w-4 h-4" />
								</button>
							)}
						</div>
					</div>

					{/* FIELD 2: PASSWORD / PIN (NUMBERS ONLY) */}
					<div className="space-y-1.5">
						<label
							htmlFor="pos-password"
							className="text-xs font-bold text-base-content/70 flex items-center gap-1.5 px-1"
						>
							<Hash className="w-3.5 h-3.5 text-secondary" />
							<span>PIN Numérico</span>
						</label>

						<div
							onClick={() => {
								setActiveField("password");
								passwordInputRef.current?.focus();
							}}
							className={`flex items-center bg-base-100 rounded-2xl border px-3.5 transition-all cursor-text ${activeField === "password"
								? "border-secondary ring-3 ring-secondary/15"
								: "border-base-300/90 hover:border-base-content/25"
								}`}
						>
							<input
								ref={passwordInputRef}
								id="pos-password"
								type={showPassword ? "text" : "password"}
								inputMode="numeric"
								pattern="[0-9]*"
								autoComplete="off"
								value={password}
								onFocus={() => setActiveField("password")}
								onChange={(e) => {
									setErrorMsg(null);
									const digitsOnly = e.target.value.replace(/\D/g, "");
									setPassword(digitsOnly);
								}}
								placeholder="58463"
								className="w-full bg-transparent py-2.5 text-sm font-black font-mono tracking-widest focus:outline-none placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:opacity-40"
							/>

							<div className="flex items-center gap-1">
								{password && (
									<button
										type="button"
										onMouseDown={(e) => e.preventDefault()}
										onClick={(e) => {
											e.stopPropagation();
											setPassword("");
											setActiveField("password");
											passwordInputRef.current?.focus();
										}}
										className="p-1 rounded-full text-base-content/40 hover:text-error transition-colors cursor-pointer"
										title="Limpiar PIN"
									>
										<X className="w-4 h-4" />
									</button>
								)}

								<button
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={(e) => {
										e.stopPropagation();
										setShowPassword((prev) => !prev);
									}}
									className="p-1 rounded-full text-base-content/45 hover:text-base-content transition-colors cursor-pointer"
									title={showPassword ? "Ocultar PIN" : "Mostrar PIN"}
								>
									{showPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>
					</div>

					{/* ANIMATED VALIDATION AND SUCCESS ALERTS */}
					<AnimatePresence mode="wait">
						{errorMsg && (
							<motion.div
								key="error-alert"
								initial={{ opacity: 0, y: -6, height: 0 }}
								animate={{ opacity: 1, y: 0, height: "auto" }}
								exit={{ opacity: 0, y: -6, height: 0 }}
								className="p-3 rounded-2xl bg-error/10 border border-error/25 text-error-content flex items-center gap-2 text-xs font-semibold"
							>
								<ShieldAlert className="w-4 h-4 text-error shrink-0" />
								<span>{errorMsg}</span>
							</motion.div>
						)}

						{loginSuccessUser && (
							<motion.div
								key="success-alert"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0 }}
								className="p-3 rounded-2xl bg-success/12 border border-success/25 text-success-content flex items-center gap-2 text-xs font-semibold"
							>
								<CheckCircle2 className="w-4 h-4 text-success shrink-0" />
								<span>
									Bienvenido, <strong>{loginSuccessUser}</strong>
								</span>
							</motion.div>
						)}
					</AnimatePresence>

					{/* SUBMIT BUTTON */}
					<motion.button
						whileHover={{ scale: 1.01 }}
						whileTap={{ scale: 0.98 }}
						type="submit"
						className="btn btn-primary w-full rounded-2xl font-bold text-sm gap-2 shadow-sm shadow-primary/20 mt-1"
					>
						<LogIn className="w-4 h-4" />
						<span>Entrar al POS</span>
					</motion.button>
				</form>

				{/* SUBTLE DEMO CREDENTIALS PILL */}
				<div className="pt-1 border-t border-base-300/60 flex items-center justify-between text-[11px] text-base-content/55">
					<span>Demo rápida:</span>
					<button
						type="button"
						onClick={fillDemoCredentials}
						className="inline-flex items-center gap-1 font-mono font-bold text-primary hover:underline cursor-pointer"
					>
						<Sparkles className="w-3 h-3" />
						<span>pepito23 / 58463</span>
					</button>
				</div>
			</motion.main>

			{/* FLOATING OVERLAY VIRTUAL KEYBOARD (Z-INDEX 999, NEVER DISPLACES CONTENT) */}
			<PosVirtualKeyboard
				isOpen={showVirtualKeyboard}
				inputName={activeField ?? "username"}
				value={activeField === "password" ? password : username}
				keyboardType={activeField === "password" ? "numeric" : "alphanumeric"}
				fieldLabel={activeField === "password" ? "PIN Numérico" : "Usuario"}
				onChange={handleVirtualKeyboardChange}
				onEnter={handleVirtualKeyboardEnter}
				onClose={() => setActiveField(null)}
			/>

			{/* REUSABLE BUTTON ON BOTTOM LEFT CORNER TO TOGGLE KEYBOARD MODE */}
			<KeyboardModeToggle />
		</div>
	);
}
