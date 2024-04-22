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

export default function App() {
  return (
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
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
