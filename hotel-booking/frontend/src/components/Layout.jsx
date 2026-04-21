import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div>
      <header className="header">
        <div className="header-top">
          <span>Tải ứng dụng</span>
          <span>Hợp tác với chúng tôi</span>
          <span>Đã lưu</span>
          <span>VND</span>
        </div>
        <div className="header-main">
          <Link to="/" className="brand">
            <div className="brand-icon">T</div>
            Traveloka
          </Link>
          <nav className="nav">
            <NavLink to="/" className="nav-link">Trang chủ</NavLink>
            <NavLink to="/rooms" className="nav-link">Khách sạn</NavLink>
            {user && user.role === 'CUSTOMER' && <NavLink to="/my-bookings" className="nav-link">Đơn của tôi</NavLink>}
            {user && <NavLink to="/profile" className="nav-link">Tài khoản</NavLink>}
            {user && ['ADMIN', 'STAFF'].includes(user.role) && <NavLink to="/admin/rooms" className="nav-link">Quản trị</NavLink>}

            {!user ? (
              <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                <Link to="/login" className="btn outline">Đăng nhập</Link>
                <Link to="/register" className="btn">Đăng ký</Link>
              </div>
            ) : (
              <button onClick={logout} className="btn outline" style={{ marginLeft: '12px' }}>Đăng xuất</button>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-section">
            <Link to="/" className="brand" style={{ marginBottom: '20px' }}>
              <div className="brand-icon">T</div>
              Traveloka
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
              Nền tảng du lịch hàng đầu Đông Nam Á, giải pháp đặt vé máy bay và phòng khách sạn giúp bạn khám phá thế giới.
            </p>
          </div>
          <div className="footer-section">
            <h4>Về Traveloka</h4>
            <ul className="footer-links">
              <li><Link to="#">Cách đặt chỗ</Link></li>
              <li><Link to="#">Liên hệ chúng tôi</Link></li>
              <li><Link to="#">Trợ giúp</Link></li>
              <li><Link to="#">Tuyển dụng</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Sản phẩm</h4>
            <ul className="footer-links">
              <li><Link to="/rooms">Khách sạn</Link></li>
              <li><Link to="#">Vé máy bay</Link></li>
              <li><Link to="#">Vé xe khách</Link></li>
              <li><Link to="#">Đưa đón sân bay</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Khác</h4>
            <ul className="footer-links">
              <li><Link to="#">Quy chế hoạt động</Link></li>
              <li><Link to="#">Chính sách Bảo mật</Link></li>
              <li><Link to="#">Điều khoản sử dụng</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2026 Traveloka. Mọi bản quyền thuộc về Traveloka.
        </div>
      </footer>
    </div>
  );
}
