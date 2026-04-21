import { Link, Outlet, useLocation } from 'react-router-dom';

export default function AdminDashboard() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="admin-layout" style={{ marginTop: '20px' }}>
      <aside className="sidebar">
        <div style={{ padding: '0 16px', marginBottom: '16px' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '4px' }}>Bảng điểu khiển</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quản trị viên hệ thống</p>
        </div>

        <Link to="/admin/customers" className={path.includes('customers') ? 'active' : ''}>
          <span style={{ marginRight: '8px' }}>👥</span> Quản lý khách hàng
        </Link>
        <Link to="/admin/employees" className={path.includes('employees') ? 'active' : ''}>
          <span style={{ marginRight: '8px' }}>💼</span> Quản lý nhân viên
        </Link>
        <Link to="/admin/roles" className={path.includes('roles') ? 'active' : ''}>
          <span style={{ marginRight: '8px' }}>🛡️</span> Quản lý vai trò
        </Link>

        <div style={{ height: '1px', background: 'var(--border-light)', margin: '10px 0' }}></div>

        <Link to="/admin/rooms" className={path.endsWith('rooms') ? 'active' : ''}>
          <span style={{ marginRight: '8px' }}>🛏️</span> Danh sách phòng
        </Link>
        <Link to="/admin/room-types" className={path.includes('room-types') ? 'active' : ''}>
          <span style={{ marginRight: '8px' }}>🗂️</span> Loại phòng
        </Link>
        <Link to="/admin/amenities" className={path.includes('amenities') ? 'active' : ''}>
          <span style={{ marginRight: '8px' }}>✨</span> Tiện nghi
        </Link>

        <div style={{ height: '1px', background: 'var(--border-light)', margin: '10px 0' }}></div>

        <Link to="/admin/bookings" className={path.endsWith('bookings') ? 'active' : ''}>
          <span style={{ marginRight: '8px' }}>📋</span> Danh sách đặt phòng
        </Link>
        <Link to="/admin/booking/new" className={path.includes('new') ? 'active' : ''}>
          <span style={{ marginRight: '8px' }}>➕</span> Tạo đơn đặt phòng
        </Link>
      </aside>

      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  );
}
