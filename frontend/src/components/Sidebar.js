import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    FilePlus,
    PlusCircle,
    Package,
    LogOut
} from "lucide-react";

import "./Sidebar.css";

const Sidebar = () => {

    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <div className="sidebar">

            <p className="sidebar-menu-label">MENU</p>

            <nav className="sidebar-nav">

                <NavLink to="/dashboard" className="sidebar-link">
                    <LayoutDashboard size={20} />
                    Dashboard
                </NavLink>

                <NavLink to="/create-bills" className="sidebar-link">
                    <FilePlus size={20} />
                    Create Bill
                </NavLink>

                <NavLink to="/add-product" className="sidebar-link">
                    <PlusCircle size={20} />
                    Add Product
                </NavLink>

                <NavLink to="/view-products" className="sidebar-link">
                    <Package size={20} />
                    View Products
                </NavLink>

            </nav>

            <div className="sidebar-bottom">
                <button className="sidebar-logout" onClick={handleLogout}>
                    <LogOut size={20} />
                    Log Out
                </button>
            </div>

        </div>
    );
};

export default Sidebar;