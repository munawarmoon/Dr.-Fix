import { Routes, Route } from "react-router-dom";
import Home from "./client/jsx/home";
import Login from "./client/jsx/login";
import Signup from "./client/jsx/signup";
import Otp from "./client/jsx/otp";
import Services from "./client/jsx/services";
import ClientDashboard from "./client/jsx/client_dashboard";
import Checkout from "./client/jsx/checkout";
import BookingConfirmed from "./client/jsx/confirmation";
import BookingTracking from "./client/jsx/booking-tracking";
import Profile from "./client/jsx/profile";
import ProtectedRoute from "./client/jsx/ProtectedRoute";

import AdminLogin from "./admin/jsx/login";
import AdminDashboard from "./admin/jsx/dashboard";
import AdminProtectedRoute from "./admin/jsx/AdminProtectedRoute";
import AdminApprovals from "./admin/jsx/approvals";

import TechnicianLogin from "./technician/jsx/login";
import TechnicianDashboard from "./technician/jsx/dashboard";
import ApplicationUnderReview from "./technician/jsx/application";
import TechnicianProtectedRoute from "./technician/jsx/TechnicianProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/services" element={<Services />} />
      <Route
        path="/client_dashboard"
        element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-confirmed"
        element={
          <ProtectedRoute>
            <BookingConfirmed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-tracking"
        element={
          <ProtectedRoute>
            <BookingTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin — separate session from the customer routes above */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <AdminProtectedRoute>
            <AdminApprovals />
          </AdminProtectedRoute>
        }
      />

      {/* Technician — now protected, matching customer/admin routes */}
      <Route path="/technician/login" element={<TechnicianLogin />} />
      <Route
        path="/technician/dashboard"
        element={
          <TechnicianProtectedRoute>
            <TechnicianDashboard />
          </TechnicianProtectedRoute>
        }
      />
      <Route
        path="/technician/application-under-review"
        element={<ApplicationUnderReview />}
      />
    </Routes>
  );
}

export default App;