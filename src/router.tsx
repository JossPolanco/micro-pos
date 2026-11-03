import HealthDashboard from "./features/system-monitor/HealthDashboard";
import { createHashRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./features/auth/LoginPage";
import Home from "./features/home/Home";

export const router = createHashRouter([
	{
		path: "/",
		element: <LoginPage />,
	},
	{
		path: "/login",
		element: <LoginPage />,
	},
	{
		path: "/home",
		element: <Home />,
	},
	{
		path: "/health",
		element: <HealthDashboard />,
	},
]);

export function AppRouter() {
	return <RouterProvider router={router} />;
}

export default AppRouter;
