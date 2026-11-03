import { createHashRouter, RouterProvider, Outlet, useRouteError } from "react-router-dom";
import HealthDashboard from "./features/system-monitor/HealthDashboard";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import LoginPage from "./features/auth/LoginPage";
import Layout from "./core/layout/Layout";
import Home from "./features/home/Home";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from 'react';

interface BoundaryMessage {
	statusText?: string;
	message?: string;
	status?: number;
}

const PageLoader = () => (
	<div className="flex items-center justify-center min-h-[60vh]">
		<span className="loading loading-spinner loading-lg text-primary"></span>
	</div>
);

const LazyPage = ({ children }: { children: React.ReactNode }) => (
	<Suspense fallback={<PageLoader />}>
		{children}
	</Suspense>
);

const RootErrorBoundary = (): React.ReactNode => {
	const error = useRouteError() as BoundaryMessage;
	console.error(error);
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-base-100 text-base-content">
			<h1 className="text-2xl font-bold mb-2">¡Ups! Algo salió mal.</h1>
			<p className="text-sm opacity-70 mb-4">
				{error?.statusText || error?.message || "Ha ocurrido un error inesperado."}
			</p>
			<button
				type="button"
				onClick={() => window.location.assign('/')}
				className="btn btn-primary btn-sm rounded-xl"
			>
				Volver al inicio
			</button>
		</div>
	);
};

const RootLayout = () => {
	return (
		<>
			<Suspense fallback={null}>
				{/* <SessionExpiredModal /> */}
			</Suspense>
			<Outlet />
		</>
	);
};


export const router = createHashRouter([
	{
		element: <RootLayout />,
		errorElement: <RootErrorBoundary />,
		children: [
			{
				path: "/",
				element: <LoginPage />,
			},
			{
				path: "*",
				element: (
					<LazyPage>
						<NotFound />
					</LazyPage>
				)
			},
			{
				path: "/login",
				element: (
					<LazyPage>
						<LoginPage />
					</LazyPage>
				)
			},
			{
				path: "/home",
				element: (
					<LazyPage>
						<Layout>
							<Home />
						</Layout>
					</LazyPage>
				)
			},
			{
				element: <LazyPage><ProtectedRoute /></LazyPage>,
				children: [
					// {
					//     path: "/testing",
					//     element: (
					//         <LazyPage>
					//             <Layout>
					//                 <TestingPage />
					//             </Layout>
					//         </LazyPage>
					//     )
					// },
					// {
					// 	path: "/home",
					// 	element: (
					// 		<LazyPage>
					// 			<Layout>
					// 				<Home />
					// 			</Layout>
					// 		</LazyPage>
					// 	)
					// },
					{
						path: "/health",
						element: (
							<LazyPage>
								<Layout>
									<HealthDashboard />
								</Layout>
							</LazyPage>
						)
					}
				]
			}
		]
	}
]);

export function AppRouter() {
	return <RouterProvider router={router} />;
}

export default AppRouter;
