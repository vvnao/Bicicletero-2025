import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "@services/auth.service";
import { useAuth } from "@context/AuthContext";
import "../styles/Login.css";
import mascotImage from "../assets/mascot.png";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mostrarPass, setMostrarPass] = useState(false);

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    const getRedirectPathByRole = (role) => {
        switch (role) {
            case 'admin':
                return '/home/admin';
            case 'guardia':
                return '/home/guardia';
            case 'estudiante':
            case 'academico':
            case 'asistente':
            default:
                return '/home/user';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await login(credentials);

            const token = res?.token ?? res?.data?.token;
            const userData = res?.data?.user ?? res?.user;

            if (token && userData) {
                const userInfo = {
                    token,
                    data: userData,
                };
                sessionStorage.setItem("user", JSON.stringify(userInfo));
                setUser(userInfo);

                const redirectPath = getRedirectPathByRole(userData.role);
                navigate(redirectPath, { replace: true });

            } else {
                setError(res?.message || "Credenciales incorrectas.");
            }
        } catch (err) {
            console.error("Error al iniciar sesión:", err);

            const backendMessage =
                err?.message ||
                err?.errorDetails?.[0] ||
                "Credenciales incorrectas.";
            setError(backendMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-container">
            <div className="login-wrapper">
                <div className="login-form-container">
                    <h1 className="login-title">BICICLETERO UBB</h1>
                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label className="login-label">CORREO ELECTRÓNICO</label>
                            <div className="login-input-wrapper">
                                <Mail size={20} color="#3e4856" className="login-input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="tucorreo@ejemplo.cl"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    className="login-input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <label className="login-label">CONTRASEÑA</label>
                            <div className="login-input-wrapper login-pass-wrapper">
                                <Lock size={20} color="#3e4856" className="login-input-icon" />
                                <input
                                    type={mostrarPass ? "text" : "password"}
                                    name="password"
                                    placeholder="*******"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    className="login-input"
                                    required
                                />
                                <button type="button" className="toggle-pass" onClick={() => setMostrarPass(!mostrarPass)}>
                                    {mostrarPass ? <EyeOff size={20} color="#3e4856" /> : <Eye size={20} color="#3e4856" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-button"
                        >
                            {loading ? "Ingresando..." : "Ingresar"}
                        </button>
                    </form>

                    <p className="login-link">
                        ¿No tienes cuenta?{" "}
                        <Link to="/auth/register">Regístrate aquí</Link>
                    </p>
                </div>

                <div className="login-mascot">
                    <img src={mascotImage} alt="Mascota Bicicletero UBB" />
                </div>
            </div>
        </main>
    );
};

export default Login;