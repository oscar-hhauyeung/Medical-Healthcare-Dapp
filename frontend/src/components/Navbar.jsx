import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import { Link } from "react-router-dom";
import { SidebarData } from "./SidebarData";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";

function Navbar(props) {
  const [sidebar] = useState(true);
  const cookies = new Cookies();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the JWT token from the cookie
    cookies.remove("auth");
    // Redirect the user to the home page
    navigate("/");
  };
  // using tailwind css for styling
  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-gray-800">
        <div className="flex justify-between">
          <Link to="#" className="text-white p-4">
            <FaIcons.FaBars />
          </Link>
        </div>
      </nav>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex flex-col">
            <nav className="flex-1 bg-gray-200">
              <ul className="flex flex-col">
                {SidebarData.map((item, index) => {
                  return (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className="flex items-center p-4 hover:bg-gray-300"
                      >
                        {item.icon}
                        <span className="mx-4">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
                <li onClick={handleLogout}>
                  <Link
                    to="#"
                    className="flex items-center p-4 hover:bg-gray-300"
                  >
                    <FaIcons.FaSignOutAlt />
                    <span className="mx-4">Logout</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
