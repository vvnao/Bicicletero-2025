"use strict";
import NavBarUser from "./NavBarUser";
import SidebarUser from "./SidebarUser";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#272e4b]">
        <NavBarUser />

        <div className="flex flex-1">
            <SidebarUser />

            <main className="flex-1 p-8 transition-all duration-300">
            <Outlet />
            </main>
        </div>
        </div>
    );
};

export default UserLayout;
