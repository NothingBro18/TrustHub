import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';

// Public pages
import HomePage from './pages/public/HomePage';
import SearchPage from './pages/public/SearchPage';
import ProviderProfilePage from './pages/public/ProviderProfilePage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Customer pages
import CustomerDashboard from './pages/user/CustomerDashboard';
import MyBookings from './pages/user/MyBookings';
import BookingPage from './pages/user/BookingPage';

// Provider pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderBookings from './pages/provider/ProviderBookings';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFlagged from './pages/admin/AdminFlagged';

// Placeholder for pages not yet built
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <h1 className="text-4xl font-bold text-gray-800">404</h1>
    <p className="text-gray-500">Page not found</p>
    <a href="/" className="btn-primary">Go Home</a>
  </div>
);

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <h1 className="text-4xl font-bold text-red-500">403</h1>
    <p className="text-gray-500">You are not authorized to view this page</p>
    <a href="/" className="btn-primary">Go Home</a>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<SearchPage />} />
          <Route path="/providers/:id" element={<ProviderProfilePage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* Customer Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['customer']}><MyBookings /></ProtectedRoute>} />
          <Route path="/book/:providerId" element={<ProtectedRoute allowedRoles={['customer']}><BookingPage /></ProtectedRoute>} />

          {/* Provider Routes */}
          <Route path="/provider/dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
          <Route path="/provider/bookings" element={<ProtectedRoute allowedRoles={['provider']}><ProviderBookings /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/flagged" element={<ProtectedRoute allowedRoles={['admin']}><AdminFlagged /></ProtectedRoute>} />

          {/* Fallbacks */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
