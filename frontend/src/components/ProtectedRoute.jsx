import { Navigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

function ProtectedRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    // Si el usuario está autenticado pero intenta acceder a una ruta que no corresponde a su rol
    // lo redirigimos a la ruta correcta
    const currentPath = window.location.pathname;
    const userRole = user.data?.role;

    if (userRole === 'admin' && !currentPath.includes('/home/admin')) {
        return <Navigate to="/home/admin" replace />;
    }

    if (userRole === 'guardia' && !currentPath.includes('/home/guardia')) {
        return <Navigate to="/home/guardia" replace />;
    }

    // Para otros roles (estudiante, academico, asistente) permitimos acceso a /home
    if ((userRole === 'estudiante' || userRole === 'academico' || userRole === 'asistente') && 
        !currentPath.includes('/home')) {
        return <Navigate to="/home" replace />;
    }

    return children;
}

export default ProtectedRoute;