import { HashRouter, Routes, Route, Navigate } from "react-router-dom"
import ProphoneV3 from "./prophone_v3"
import AdminCompanies from "./pages/AdminCompanies"
import "./App.css"

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ProphoneV3 />} />
        <Route path="/admin/companies" element={<AdminCompanies />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
