import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientPage from "./pages/PatientPage";
import DoctorPage from "./pages/DoctorPage/";
import NoPage from "./pages/NoPage";
import "./index.css";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function App() {
  return (
    <GoogleOAuthProvider clientId="283543723581-spfrtomaftn3u6ctqpmjnptrjil4sc5m.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          {/* <Route index element={<Home />} /> */}
          <Route path="register/:userType" element={<RegisterPage />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="patient" element={<PatientPage />} />
            <Route path="doctor" element={<DoctorPage />} />
          </Route>
          <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
