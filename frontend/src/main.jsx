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
import HomeAdmin from "./pages/admin/HomeAdmin";
import HomeGuardia from "@pages/HomeGuardia";
import HomeUser from "@pages/HomeUser";
import BicicletasAdmin from "./pages/admin/BicicletasAdmin";
import GuardiasAdmin from "./pages/admin/GuardiasAdmin";
import HistorialAdmin from "./pages/admin/HistorialAdmin";
import ReportesAdmin from "./pages/admin/ReportesAdmin";
import PrivateProfile from "@pages/PrivateProfile";
import BicycleProfile from "@pages/BicycleProfile";
import Bicycles from "./pages/Bicycles";
import "./styles/Styles.css";

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
            //RUTAS DE USUARIO
            {
                path: "home/user",
                element: (
                    <ProtectedRoute>
                        <HomeUser />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/home/user/privateProfile",
                element: (
                    <ProtectedRoute>
                        <PrivateProfile />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/home/user/bicycles",
                element: (
                    <ProtectedRoute>
                        <BicycleProfile/>
                    </ProtectedRoute>
                )
            },
            {
                path: "/home/user/AddBicycles",
                element: (
                    <ProtectedRoute>
                        <Bicycles/>
                    </ProtectedRoute>
                )
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
            {
                path: "home/admin/perfil",
                element: (
                    <ProtectedRoute>
                        <PrivateProfile />
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