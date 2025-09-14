import { NavLink } from "react-router-dom"
import { MdSpaceDashboard } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { IoVideocam } from "react-icons/io5";
import { IoLogOut } from "react-icons/io5";


export default function UserSideBar() {
    const style = (({ isActive }) =>
                        `flex items-center gap-2 left-5 text-lg mt-5 px-3 py-2 rounded-lg transition-colors duration-200 ${
                            isActive ? "bg-violet-300 text-violet-900 font-semibold" : ""
                        }`)
    
    return (
        <div className="flex flex-col justify-between h-lvh sticky overflow-x-hidden min-w-70 left-0 top-0 px-7 py-8">
            <div className="flex flex-col">
                <NavLink to='/userdashboard' className="mb-10">
                    <span className="font-bold text-xl text-violet-600">
                        Traffic Signal Optimizer
                    </span>
                </NavLink>
                <NavLink
                    to="/userdashboard"
                    className={style}
                >
                    <MdSpaceDashboard />
                    <span>Dashboard</span>
                </NavLink> 
                <NavLink
                    to="/userlivefeed"
                    className={style}
                >
                    <IoVideocam />
                    <span>Live Feed</span>
                </NavLink>
                <NavLink
                    to="/usersettings"
                    className={style}
                >
                    <IoSettingsSharp />
                    <span>Settings</span>
                </NavLink>
            </div>
            <div className="flex items-center gap-2 left-5 text-lg px-3 py-2 rounded-lg transition-colors duration-300 hover:bg-rose-900 hover:text-neutral-200 font-semibold hover:shadow-md">
                <IoLogOut />
                <button>
                    Logout
                </button>

            </div>
        </div>
    )
}