import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import { Link } from "react-router-dom";
import { SidebarData } from "./SidebarData";
import "./Navbar.css";
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

  return (
    <div className="navbarComponent">
      <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
        <ul className="nav-menu-items">
          <li className="navbar-toggle">
            <Link to="#" className="menu-bars">
              <FaIcons.FaBars />
            </Link>
          </li>
          {SidebarData.map((item, index) => {
            if (item.userType === props.userType || item.userType === "both") {
              return (
                <li key={index} className={item.cName} onClick={handleLogout}>
                  {item.icon}
                  <span>{item.title}</span>
                </li>
              );
            } else {
              return null;
            }
          })}
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
