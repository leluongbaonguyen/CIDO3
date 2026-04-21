import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import ProfilePage from './pages/ProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminRoomsPage from './pages/AdminRoomsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminRoomTypesPage from './pages/AdminRoomTypesPage';
import AdminAmenitiesPage from './pages/AdminAmenitiesPage';
import AdminRolesPage from './pages/AdminRolesPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
            <Route path="rooms" element={<AdminRoomsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="employees" element={<AdminEmployeesPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="room-types" element={<AdminRoomTypesPage />} />
            <Route path="amenities" element={<AdminAmenitiesPage />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
