import React from "react";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as MdIcons from "react-icons/md";

export const SidebarData = [
    {
        title: "Dashboard",
        cName: "nav-text",
        userType: "patient",
        icon: <FaIcons.FaClinicMedical />
    },
    {
        title: "Medical Record",
        cName: "nav-text",
        userType: "patient",
        icon: <FaIcons.FaBookMedical />
    },
    {
        title: "Booking",
        cName: "nav-text",
        userType: "patient",
        icon: <FaIcons.FaCalendarAlt />

    },
    {
        title: "Doctors",
        cName: "nav-text",
        userType: "patient",
        icon: <Fa6Icons.FaUserDoctor />
    },
    {
        title: "Medications",
        cName: "nav-text",
        userType: "patient",
        icon: <MdIcons.MdMedicationLiquid />
    },
    {
        title: "Profile",
        cName: "nav-text",
        userType: "doctor",
        icon: <MdIcons.MdPerson />
    },
    {
        title: "Appointments",
        cName: "nav-text",
        userType: "doctor",
        icon: <FaIcons.FaCalendarAlt />
    },
    {
        title: "Patients",
        cName: "nav-text",
        userType: "doctor",
        icon: <MdIcons.MdPeople />
    },
    {
        title: "Perscriptions",
        cName: "nav-text",
        userType: "doctor",
        icon: <MdIcons.MdMedicationLiquid />
    },
    {
        title: "Chat",
        cName: "nav-text",
        userType: "both",
        icon: <MdIcons.MdChat />
    },
    {
        title: "Settings",
        cName: "nav-text",
        userType: "both",
        icon: <MdIcons.MdSettings />
    },
    {
        title: "Logout",
        cName: "nav-text",
        userType: "both",
        icon: <MdIcons.MdLogout />
    },
]