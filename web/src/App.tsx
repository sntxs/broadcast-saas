import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./layouts/AppLayout";
import { ConnectionsPage } from "./pages/ConnectionsPage";
import { ContactsPage } from "./pages/ContactsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}