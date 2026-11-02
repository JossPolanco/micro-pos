import { createHashRouter, RouterProvider } from "react-router-dom";
import Home from "./features/home/Home";
import HealthDashboard from "./features/system-monitor/HealthDashboard";

export const router = createHashRouter([
	{
		path: "/",
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

