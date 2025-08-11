import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import InitiativeForm from "./pages/InitiativeForm.jsx";
import WorkflowManagement from "./pages/WorkflowManagement.jsx";
import KPITracking from "./pages/KPITracking.jsx";
import InitiativeClosure from "./pages/InitiativeClosure.jsx";
import Reports from "./pages/Reports.jsx";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/initiatives/new"
              element={
                <ProtectedRoute>
                  <InitiativeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflow"
              element={
                <ProtectedRoute>
                  <WorkflowManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kpi-tracking"
              element={
                <ProtectedRoute>
                  <KPITracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/closure"
              element={
                <ProtectedRoute>
                  <InitiativeClosure />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;