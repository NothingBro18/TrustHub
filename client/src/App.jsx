import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';

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

// Messages page
import MessagesPage from './pages/common/MessagesPage';
import ReviewsPage from './pages/common/ReviewsPage';
import NotificationsPage from './pages/common/NotificationsPage';
import AccountPage from './pages/common/AccountPage';
import SavedProvidersPage from './pages/user/SavedProvidersPage';
import ProviderServicesPage from './pages/provider/ProviderServicesPage';
import AdminServices from './pages/admin/AdminServices';
import AdminProviders from './pages/admin/AdminProviders';
import AdminReports from './pages/admin/AdminReports';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <h1 className="text-4xl font-bold text-gray-800">404</h1>
    <p className="text-gray-500">Page not found</p>
    <Link to="/" className="btn-primary">Go Home</Link>
  </div>
);

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <h1 className="text-4xl font-bold text-red-500">403</h1>
    <p className="text-gray-500">You are not authorized to view this page</p>
    <Link to="/" className="btn-primary">Go Home</Link>
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
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

          {/* Customer Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['customer']}><MyBookings /></ProtectedRoute>} />
          <Route path="/saved-providers" element={<ProtectedRoute allowedRoles={['customer']}><SavedProvidersPage /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute allowedRoles={['customer']}><ReviewsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}><AccountPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}><AccountPage /></ProtectedRoute>} />
          <Route path="/book/:providerId" element={<ProtectedRoute allowedRoles={['customer']}><BookingPage /></ProtectedRoute>} />

          {/* Provider Routes */}
          <Route path="/provider/dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
          <Route path="/provider/bookings" element={<ProtectedRoute allowedRoles={['provider']}><ProviderBookings /></ProtectedRoute>} />
          <Route path="/provider/services" element={<ProtectedRoute allowedRoles={['provider']}><ProviderServicesPage /></ProtectedRoute>} />
          <Route path="/provider/reviews" element={<ProtectedRoute allowedRoles={['provider']}><ReviewsPage /></ProtectedRoute>} />
          <Route path="/provider/earnings" element={<ProtectedRoute allowedRoles={['provider']}><AccountPage earnings /></ProtectedRoute>} />
          <Route path="/provider/profile" element={<ProtectedRoute allowedRoles={['provider']}><AccountPage /></ProtectedRoute>} />
          <Route path="/provider/settings" element={<ProtectedRoute allowedRoles={['provider']}><AccountPage /></ProtectedRoute>} />

          {/* Messages Route (Customer, Provider, Admin) */}
          <Route path="/messages" element={<ProtectedRoute allowedRoles={['customer', 'provider']}><MessagesPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}><NotificationsPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/providers" element={<ProtectedRoute allowedRoles={['admin']}><AdminProviders /></ProtectedRoute>} />
          <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin']}><AdminServices /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AccountPage /></ProtectedRoute>} />
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
