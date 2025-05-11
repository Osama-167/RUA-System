import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import EmergencyPage from "./components/EmergencyPage";
import MaintenancePage from "./components/MaintenancePage";
import SupervisorPage from "./components/SupervisorPage";
import AdminPage from "./components/AdminPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/supervisor" element={<SupervisorPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
