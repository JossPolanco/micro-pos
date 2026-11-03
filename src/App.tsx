import { KeyboardProvider } from "./context/KeyboardContext";
import AppRouter from "./router";

export default function App() {
	return (
		<KeyboardProvider>
			<AppRouter />
		</KeyboardProvider>
	);
}
