import { useNavigate } from "react-router-dom";

export default function RegisterSelector() {
    const navigate = useNavigate();
    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">¿Qué tipo de persona eres?</h2>
            <div className="flex flex-col gap-3">
                <button onClick={() => navigate("/auth/register/student")} className="p-2 bg-blue-600 text-white rounded">Estudiante</button>
                <button onClick={() => navigate("/auth/register/academic")} className="p-2 bg-blue-600 text-white rounded">Académico</button>
                <button onClick={() => navigate("/auth/register/assistant")} className="p-2 bg-blue-600 text-white rounded">Funcionario</button>
                
                <button 
                    onClick={() => navigate("/auth/login")} 
                    className="p-2 mt-4 text-blue-600 hover:text-blue-800 underline"
                >
                    ← Volver al inicio de sesión
                </button>
            </div>
        </div>
    );
}