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
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
);
