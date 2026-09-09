import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import ProphoneV3 from "./prophone_v3";
import AdminCompanies from "./pages/AdminCompanies";
import VerifyEmail from "./pages/VerifyEmail";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ProphoneV3 />} />
        <Route path="/admin/companies" element={<AdminCompanies />} />
        <Route path="/verify" element={<VerifyEmail />} />
      </Routes>
    </HashRouter>
  );
}

export default App;