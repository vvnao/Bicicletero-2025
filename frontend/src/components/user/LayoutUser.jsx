"use strict";
import { useState } from "react";
import NavBarUser from "./NavBarUser";
import SidebarUser from "./SidebarUser";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
    const [sidebarHover, setSidebarHover] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-[#272e4b]">
            <NavBarUser sidebarHover={sidebarHover} />

            <div className="flex flex-1 relative pt-[70px]"> 
                
                <SidebarUser 
                    sidebarHover={sidebarHover} 
                    setSidebarHover={setSidebarHover} 
                />

                <main 
                    className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
                        sidebarHover ? "ml-[240px]" : "ml-[80px]"
                    }`}
                >
                    <div className="mt-3">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserLayout;