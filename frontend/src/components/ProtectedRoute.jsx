import { Navigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

function ProtectedRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }
     if (user.role === 'admin') {
        return <Navigate to="/home/admin" replace />;
    }


    return children;
}

export default ProtectedRoute;
