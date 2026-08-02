import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import TicketForm from "./pages/TicketForm";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Tickets />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <TicketDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <TicketForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <TicketForm />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
