import { Link } from "react-router-dom";

function Error404() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-8">
            <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
            <p className="text-gray-600 mb-6">
                La página que estás buscando no existe o fue movida.
            </p>
            <Link
                to="/"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
                Volver al inicio
            </Link>
        </div>
    );
}

export default Error404;