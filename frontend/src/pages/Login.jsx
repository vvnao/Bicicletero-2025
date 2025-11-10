import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "@services/auth.service";
import { useAuth } from "@context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth(); 
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await login(credentials);

            const token = res?.token ?? res?.data?.token;
            const userData = res?.data?.user ?? res?.user;

            if (token) {
                const userInfo = {
                    token,
                    data: userData,
                };
                sessionStorage.setItem("user", JSON.stringify(userInfo));
                setUser(userInfo); // Añadir esto para actualizar el contexto
                
                navigate("/home", { replace: true });
                
            } else {
                setError(res?.message || "Credenciales incorrectas.");
            }
        } catch (err) {
            console.error("Error al iniciar sesión:", err);
            setError("Ocurrió un error al iniciar sesión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 bg-white p-6 rounded-lg shadow-md w-80"
            >
                <h1 className="text-2xl font-bold text-center mb-2 text-blue-600">
                    Bicicletero UBB 🚲
                </h1>

                {error && (
                    <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">
                        {error}
                    </p>
                )}

                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={credentials.email}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={credentials.password}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className={`${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                        } text-white p-2 rounded transition`}
                >
                    {loading ? "Ingresando..." : "Ingresar"}
                </button>

                <p className="text-sm text-center mt-2">
                    ¿No tienes cuenta?{" "}
                    <Link to="/auth/register" className="text-blue-600 hover:underline">
                        Regístrate aquí
                    </Link>
                </p>
            </form>
        </main>
    );
};

export default Login;
