import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => (
	<Routes>
		<Route path="/login" element={<Login />} />
		<Route element={<ProtectedRoute />}>
			<Route path="/" element={<Navigate to="/dashboard" replace />} />
			<Route path="/dashboard" element={<Dashboard />} />
		</Route>
		<Route path="*" element={<Navigate to="/dashboard" replace />} />
	</Routes>
);

export default App;