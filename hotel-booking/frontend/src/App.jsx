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
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import GalleryPage from './pages/GalleryPage';
import BookingPage from './pages/BookingPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminRoomsPage from './pages/AdminRoomsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminNewBookingPage from './pages/AdminNewBookingPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminRoomTypesPage from './pages/AdminRoomTypesPage';
import AdminAmenitiesPage from './pages/AdminAmenitiesPage';
import AdminRolesPage from './pages/AdminRolesPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import AdminOverview from './pages/AdminOverview';
import AdminSupportPage from './pages/AdminSupportPage';

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
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/gallery" element={<GalleryPage />} />

          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE']}><AdminDashboard /></ProtectedRoute>}>
            <Route index element={<AdminOverview />} />
            <Route path="rooms" element={<AdminRoomsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="booking/new" element={<AdminNewBookingPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="employees" element={<AdminEmployeesPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="room-types" element={<AdminRoomTypesPage />} />
            <Route path="amenities" element={<AdminAmenitiesPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="support" element={<AdminSupportPage />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
