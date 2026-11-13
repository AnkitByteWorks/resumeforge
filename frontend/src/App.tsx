import { Navigate, Route, Routes } from 'react-router'
import ProtectedRoute from './auth/ProtectedRoute'
import CreateResumePage from './pages/CreateResumePage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PublicResumePage from './pages/PublicResumePage'

export default function App() {
  return (
    <Routes>
      <Route path="/p/:slug" element={<PublicResumePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/new" element={<CreateResumePage />} />
        <Route path="/create" element={<CreateResumePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
