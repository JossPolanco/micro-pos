import KeyboardModeToggle from "../../components/ui/KeyboardModeToggle";
import { Activity, LogOut, Sparkles, UserCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface LocationState {
	username?: string;
}

export default function Home() {
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as LocationState | null;
	const activeUser = state?.username || "pepito23";

	return (
		<div className="min-h-screen bg-base-100 text-base-content p-6 pb-28 flex flex-col items-center justify-center select-none">
			<div className="bg-base-200 rounded-3xl p-8 max-w-md w-full border border-base-300/80 shadow-sm text-center space-y-6">
				<div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
					<Sparkles className="w-8 h-8 text-primary" />
				</div>

				<div className="space-y-2">
					<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/15 text-success text-xs font-extrabold">
						<UserCheck className="w-3.5 h-3.5" />
						<span>Cajero activo: {activeUser}</span>
					</div>
					<h1 className="text-3xl font-black tracking-tight text-base-content">
						Panel Principal POS
					</h1>
					<p className="text-sm opacity-60">
						Micro-POS • Arquitectura Base Inicial
					</p>
				</div>

				<div className="space-y-3 pt-2">
					<button
						onClick={() => navigate("/health")}
						className="btn btn-primary rounded-2xl w-full gap-2 shadow-sm shadow-primary/25 hover:shadow-md transition-all"
					>
						<Activity className="w-4 h-4" />
						<span>Ir al Monitor de Salud y Sidecar</span>
					</button>

					<button
						onClick={() => navigate("/")}
						className="btn btn-ghost bg-base-100 hover:bg-base-300/70 border border-base-300 rounded-2xl w-full gap-2 font-bold"
					>
						<LogOut className="w-4 h-4" />
						<span>Cerrar Sesión / Volver al Login</span>
					</button>
				</div>
			</div>

			{/* REUSABLE KEYBOARD MODE SELECTOR BUTTON */}
			<KeyboardModeToggle />
		</div>
	);
}
