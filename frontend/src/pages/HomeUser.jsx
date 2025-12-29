"use strict";
import mascotImage from "../assets/mascot.png";
import fondo from "../assets/fondo-login.png";

const HomeUser = () => {
    return (
        <div 
            className="fixed inset-0 w-full h-full overflow-hidden bg-cover bg-center bg-no-repeat flex items-center justify-center p-6 md:p-20"
            style={{ backgroundImage: `url(${fondo})` }}
        >
            <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]"></div>

            <main className="relative z-10 bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row transition-all">
        
                <div className="flex-1 p-8 md:p-20 flex flex-col justify-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight">
                        Bienvenido
                    </h2>
                    <div className="w-80 h-1 bg-blue-500 my-4 rounded-full"></div>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                        Tu seguridad es nuestra prioridad. Un espacio de confianza diseñado exclusivamente para 
                        estudiantes, funcionarios y académicos
                        de la UBB.
                    </p>
                </div>

                <div className="flex-1 bg-blue-50/50 flex items-center justify-center p-8 relative overflow-hidden min-h-[300px] md:min-h-full">
                    <div className="absolute w-64 h-64 bg-blue-200 rounded-full opacity-40"></div>
                    
                    <img 
                        src={mascotImage} 
                        alt="Mascota UBB" 
                        className="relative z-10 w-48 md:w-64 h-auto drop-shadow-2xl object-contain"
                    />
                </div>
            </main>
        </div>
    );
};

export default HomeUser;