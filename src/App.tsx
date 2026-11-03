import { AuthProvider } from "./features/auth/context/AuthContext";
import { KeyboardProvider } from "./context/KeyboardContext";
import AppRouter from "./router";

export default function App() {
	return (
		<AuthProvider>
			<KeyboardProvider>
				<AppRouter />
			</KeyboardProvider>
		</AuthProvider>
	);
}
