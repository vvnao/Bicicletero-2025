"use strict";

const NavBar = ({ sidebarHover }) => {
    return (
        <header 
            // Bajamos el z-index a 900
            className="fixed top-0 left-0 right-0 h-[70px] bg-[#323954] text-white flex items-center shadow-lg border-b border-white/5 z-[900] transition-all duration-300"
        >
            <div 
                className={`transition-all duration-300 px-6 ${
                    sidebarHover ? "ml-[240px]" : "ml-[80px]"
                }`}
            >
                <h1 className="text-2xl font-bold tracking-tight">
                    Bicicletero <span className="text-[#4a90e2]">UBB</span>
                </h1>
            </div>
        </header>
    );
};

export default NavBar;