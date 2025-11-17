import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "@pages/Login";
import Home from "@pages/Home";
import Error404 from "@pages/Error404";
import Root from "@pages/Root";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "@components/ProtectedRoute";
import RegisterSelector from "./pages/RegisterSelector";
import RegisterStudent from "./pages/RegisterStudent";
import RegisterAcademic from "./pages/RegisterAcademic";
import RegisterAssistant from "./pages/RegisterAssistant";
import HomeAdmin from "@pages/HomeAdmin";
import HomeGuardia from "@pages/HomeGuardia";
import BicicletasAdmin from "@pages/BicicletasAdmin";
import GuardiasAdmin from "@pages/GuardiasAdmin";
import HistorialAdmin from "@pages/HistorialAdmin";
import ReportesAdmin from "@pages/ReportesAdmin";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <Error404 />,
        children: [
            {
                index: true,
                element: <Navigate to="/auth/login" replace />,
            },
            {
                path: "auth/login",
                element: <Login />,
            },
            {
                path: "auth/register",
                element: <RegisterSelector />,
            },
            {
                path: "auth/register/student",
                element: <RegisterStudent />,
            },
            {
                path: "auth/register/academic",
                element: <RegisterAcademic />,
            },
            {
                path: "auth/register/assistant",
                element: <RegisterAssistant />,
            },
            {
                path: "home",
                element: (
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                ),
            },
            {
                path: "home/admin",
                element: (
                    <ProtectedRoute>
                        <HomeAdmin />
                    </ProtectedRoute>
                ),
            },
            {
                path: "home/guardia",
                element: (
                    <ProtectedRoute>
                        <HomeGuardia />
                    </ProtectedRoute>
                ),
            },
            // NUEVAS RUTAS DEL ADMIN
            {
                path: "home/admin/bicicletas",
                element: (
                    <ProtectedRoute>
                        <BicicletasAdmin />
                    </ProtectedRoute>
                ),
            },
            {
                path: "home/admin/guardias",
                element: (
                    <ProtectedRoute>
                        <GuardiasAdmin />
                    </ProtectedRoute>
                ),
            },
            {
                path: "home/admin/historial",
                element: (
                    <ProtectedRoute>
                        <HistorialAdmin />
                    </ProtectedRoute>
                ),
            },
            {
                path: "home/admin/reportes",
                element: (
                    <ProtectedRoute>
                        <ReportesAdmin />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
);