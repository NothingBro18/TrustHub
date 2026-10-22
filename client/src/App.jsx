import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Marketplace from './pages/Marketplace.jsx';

const App = () => (
	<Routes>
		<Route path="/" element={<Marketplace />} />
		<Route path="/services" element={<Marketplace />} />
		<Route path="/services/:category" element={<Marketplace />} />
		<Route path="/providers/:providerId" element={<Marketplace />} />
		<Route path="/book/:providerId" element={<Marketplace />} />
		<Route path="/dashboard" element={<Marketplace />} />
		<Route path="/provider/dashboard" element={<Marketplace />} />
		<Route path="/admin" element={<Marketplace />} />
		<Route path="/login" element={<Login />} />
		<Route path="/register" element={<Register />} />
		<Route path="/legacy-dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
		<Route path="*" element={<Navigate to="/" replace />} />
	</Routes>
);

export default App;