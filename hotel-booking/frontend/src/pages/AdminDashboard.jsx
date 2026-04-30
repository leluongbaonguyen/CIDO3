import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const location = useLocation();
  const path = location.pathname;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState({
    users: path.includes('customers') || path.includes('employees') || path.includes('roles'),
    rooms: path.includes('rooms') || path.includes('room-types') || path.includes('amenities'),
    bookings: path.includes('bookings') || path.includes('new')
  });

  const toggle = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* 1. SIDEBAR MENU */}
      <aside style={{ width: '280px', backgroundColor: '#1e293b', color: '#cbd5e1', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #334155' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>XTRAVEL ADMIN</span>
        </div>

        <nav style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
          {/* Dashboard */}
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: path === '/admin' ? '#fff' : '#cbd5e1', backgroundColor: path === '/admin' ? '#334155' : 'transparent', borderRadius: '8px', textDecoration: 'none', marginBottom: '8px', fontWeight: '500' }}>
            <i className="fas fa-th-large" style={{ width: '20px' }}></i>
            <span>Bảng điều khiển</span>
          </Link>

          {/* Booking Management */}
          <div style={{ marginBottom: '8px' }}>
            <div onClick={() => toggle('bookings')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', color: expanded.bookings ? '#fff' : '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fas fa-calendar-check" style={{ width: '20px' }}></i>
                <span style={{ fontWeight: '500' }}>Quản lý đặt phòng</span>
              </div>
              <i className={`fas fa-chevron-${expanded.bookings ? 'down' : 'right'}`} style={{ fontSize: '12px' }}></i>
            </div>
            {expanded.bookings && (
              <div style={{ paddingLeft: '48px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <Link to="/admin/bookings" style={{ color: path.endsWith('bookings') ? '#fff' : '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Danh sách đơn hàng</Link>
                <Link to="/admin/booking/new" style={{ color: path.includes('new') ? '#fff' : '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Thêm đơn mới</Link>
              </div>
            )}
          </div>

          {/* Room Management */}
          <div style={{ marginBottom: '8px' }}>
            <div onClick={() => toggle('rooms')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', color: expanded.rooms ? '#fff' : '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fas fa-bed" style={{ width: '20px' }}></i>
                <span style={{ fontWeight: '500' }}>Quản lý phòng</span>
              </div>
              <i className={`fas fa-chevron-${expanded.rooms ? 'down' : 'right'}`} style={{ fontSize: '12px' }}></i>
            </div>
            {expanded.rooms && (
              <div style={{ paddingLeft: '48px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <Link to="/admin/rooms" style={{ color: path.endsWith('rooms') ? '#fff' : '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Danh sách phòng</Link>
                <Link to="/admin/room-types" style={{ color: path.includes('room-types') ? '#fff' : '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Loại phòng</Link>
                <Link to="/admin/amenities" style={{ color: path.includes('amenities') ? '#fff' : '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Tiện nghi</Link>
              </div>
            )}
          </div>

          {/* User Management */}
          <div style={{ marginBottom: '8px' }}>
            <div onClick={() => toggle('users')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', color: expanded.users ? '#fff' : '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fas fa-users-cog" style={{ width: '20px' }}></i>
                <span style={{ fontWeight: '500' }}>Quản lý người dùng</span>
              </div>
              <i className={`fas fa-chevron-${expanded.users ? 'down' : 'right'}`} style={{ fontSize: '12px' }}></i>
            </div>
            {expanded.users && (
              <div style={{ paddingLeft: '48px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <Link to="/admin/customers" style={{ color: path.includes('customers') ? '#fff' : '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Khách hàng</Link>
                {user?.role === 'ADMIN' && (
                  <>
                    <Link to="/admin/employees" style={{ color: path.includes('employees') ? '#fff' : '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Nhân viên</Link>
                    <Link to="/admin/roles" style={{ color: path.includes('roles') ? '#fff' : '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Phân quyền (RBAC)</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Review Management */}
          <Link to="/admin/reviews" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: path.includes('reviews') ? '#fff' : '#cbd5e1', backgroundColor: path.includes('reviews') ? '#334155' : 'transparent', borderRadius: '8px', textDecoration: 'none', marginBottom: '8px', fontWeight: '500' }}>
            <i className="fas fa-star" style={{ width: '20px' }}></i>
            <span>Quản lý đánh giá</span>
          </Link>

          {/* Customer Support */}
          <Link to="/admin/support" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: path.includes('support') ? '#fff' : '#cbd5e1', backgroundColor: path.includes('support') ? '#334155' : 'transparent', borderRadius: '8px', textDecoration: 'none', marginBottom: '8px', fontWeight: '500' }}>
            <i className="fas fa-comments" style={{ width: '20px' }}></i>
            <span>Hỗ trợ khách hàng</span>
          </Link>
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid #334155', color: '#94a3b8', fontSize: '12px' }}>
          &copy; 2026 XTRAVEL v2.0
        </div>
      </aside>

      {/* RIGHT SIDE: NAVBAR + CONTENT */}
      <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column' }}>
        {/* 2. TOP NAVBAR */}
        <header style={{ height: '70px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 90 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
              <input type="text" placeholder="Tìm kiếm nhanh..." style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', cursor: 'pointer', color: '#64748b' }}>
              <i className="far fa-bell" style={{ fontSize: '20px' }}></i>
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>3</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{user?.first_name || 'Admin'}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.role || 'Quản trị viên'}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0ea5e9', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
                {user?.first_name?.[0] || 'A'}
              </div>
              <button onClick={handleLogout} title="Đăng xuất" style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', padding: '8px' }}>
                <i className="fas fa-sign-out-alt" style={{ fontSize: '18px' }}></i>
              </button>
            </div>
          </div>
        </header>

        {/* 3. MAIN CONTENT AREA */}
        <main style={{ padding: '32px', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
