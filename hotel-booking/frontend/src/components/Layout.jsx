import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Chatbot from './Chatbot';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) {
    return (
      <div className="xtravel-layout">
        <main className="main-content" style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="xtravel-layout">
      <header className="xtravel-header" style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', height: '80px' }}>
          
          {/* Logo Section */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="XTRAVEL Logo" style={{ height: '40px', borderRadius: '8px' }} />
            <span style={{ fontSize: '26px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px' }}>XTRAVEL</span>
          </Link>

          {/* Center Navigation */}
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <NavLink to="/" className="nav-item" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-dark)', fontWeight: isActive ? '700' : '600', textDecoration: 'none', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' })}>Trang chủ</NavLink>
            <NavLink to="/about" className="nav-item" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-dark)', fontWeight: isActive ? '700' : '600', textDecoration: 'none', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' })}>Giới thiệu</NavLink>
            <NavLink to="/rooms" className="nav-item" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-dark)', fontWeight: isActive ? '700' : '600', textDecoration: 'none', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' })}>Phòng</NavLink>
            <NavLink to="/blog" className="nav-item" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-dark)', fontWeight: isActive ? '700' : '600', textDecoration: 'none', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' })}>Bài viết</NavLink>
            <NavLink to="/gallery" className="nav-item" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-dark)', fontWeight: isActive ? '700' : '600', textDecoration: 'none', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' })}>Thư viện ảnh</NavLink>
          </nav>

          {/* Right Actions & Social */}
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            {!user ? (
              <div style={{ display: 'flex', alignItems: 'center', paddingRight: '24px', gap: '16px' }}>
                <Link to="/login" style={{ color: 'var(--text-dark)', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>Đăng nhập</Link>
                <Link to="/register" style={{ padding: '8px 20px', borderRadius: '4px', color: '#fff', backgroundColor: 'var(--secondary)', fontWeight: '600', fontSize: '14px', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.backgroundColor = 'var(--secondary-hover)'} onMouseLeave={e => e.target.style.backgroundColor = 'var(--secondary)'}>Đặt ngay</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', paddingRight: '24px', gap: '24px' }}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)', fontWeight: '600', textDecoration: 'none' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <i className="fas fa-user"></i>
                  </div>
                  {user.firstName || user.first_name || 'Khách hàng'}
                </Link>
                {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                  <Link to="/admin" style={{ padding: '8px 16px', borderRadius: '4px', color: '#fff', backgroundColor: 'var(--danger)', fontWeight: '600', fontSize: '14px', textDecoration: 'none', transition: 'all 0.2s' }}>
                    <i className="fas fa-cogs" style={{ marginRight: '8px' }}></i>
                    Trang quản trị
                  </Link>
                )}
                <button onClick={logout} style={{ padding: '8px 16px', borderRadius: '4px', color: 'var(--text-dark)', backgroundColor: 'transparent', border: '1px solid var(--border-light)', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Đăng xuất</button>
              </div>
            )}
            
            {/* Social Block matching design */}
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1e3a8a', padding: '0 24px', gap: '16px', color: '#fff', fontSize: '16px' }}>
              <a href="#" style={{ color: '#fff', textDecoration: 'none' }}><i className="fab fa-facebook-f"></i></a>
              <a href="#" style={{ color: '#fff', textDecoration: 'none' }}><i className="fab fa-twitter"></i></a>
              <a href="#" style={{ color: '#fff', textDecoration: 'none' }}><i className="fab fa-instagram"></i></a>
              <a href="#" style={{ color: '#fff', textDecoration: 'none' }}><i className="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content" style={{ backgroundColor: 'var(--bg-main)' }}>{children}</main>

      <footer style={{ backgroundColor: 'var(--bg-surface)', padding: '60px 0 20px', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div style={{ maxWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <img src="/logo.png" alt="XTRAVEL Logo" style={{ height: '30px', borderRadius: '6px', filter: 'grayscale(100%) opacity(0.7)' }} />
                <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '-0.5px' }}>XTRAVEL</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Nơi lưu trú tuyệt vời mang lại cho bạn những trải nghiệm nghỉ dưỡng hoàn hảo nhất với dịch vụ chuẩn 5 sao.</p>
            </div>
            <div style={{ display: 'flex', gap: '80px' }}>
              <div>
                <h4 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>Về XTRAVEL</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <li>Cách đặt phòng</li>
                  <li>Liên hệ chúng tôi</li>
                  <li>Trợ giúp</li>
                  <li>Tuyển dụng</li>
                </ul>
              </div>
              <div>
                <h4 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>Dịch vụ</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <li>Phòng nghỉ</li>
                  <li>Nhà hàng</li>
                  <li>Spa & Massage</li>
                  <li>Phòng hội nghị</li>
                </ul>
              </div>
              <div>
                <h4 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>Khác</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <li>Khách hàng thân thiết</li>
                  <li>Tin tức & Sự kiện</li>
                  <li>Chính sách bảo mật</li>
                  <li>Điều khoản sử dụng</li>
                </ul>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-light)', color: 'var(--text-light)', fontSize: '14px' }}>
            &copy; 2026 XTRAVEL. All rights reserved.
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
}
