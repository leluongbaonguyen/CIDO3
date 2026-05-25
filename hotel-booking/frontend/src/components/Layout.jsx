import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Chatbot from './Chatbot';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.includes('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* LUXURY STICKY HEADER - HIDE ON ADMIN */}
      {!isAdmin && (
        <header style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          backgroundColor: isHome ? 'rgba(10, 15, 29, 0.8)' : '#0a0f1d',
          backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(196, 166, 97, 0.2)',
          padding: '15px 0', transition: '0.4s'
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
               <img src="/logo.png" alt="BOOKING X Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: '#fff', letterSpacing: '2px', lineHeight: '1' }}>BOOKING X</span>
                  <span style={{ fontSize: '8px', fontWeight: '800', color: 'var(--gold)', letterSpacing: '2px', textTransform: 'uppercase' }}>Luxury Hotel</span>
               </div>
            </Link>

            <nav style={{ display: 'flex', gap: '35px', alignItems: 'center' }}>
               <NavLink to="/" label="TRANG CHỦ" />
               <NavLink to="/rooms" label="PHÒNG NGHỈ" />
               <NavLink to="/gallery" label="THƯ VIỆN" />
               <NavLink to="/blog" label="TIN TỨC" />
               <NavLink to="/about" label="GIỚI THIỆU" />
               {(user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') && (
                  <NavLink to="/admin" label="QUẢN TRỊ" style={{ color: 'var(--gold)' }} />
               )}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
               {user ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '50px', border: '1px solid rgba(196, 166, 97, 0.3)' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: '800' }}>{(user?.firstName || user?.first_name || 'U')[0]}</div>
                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>{user?.firstName || user?.first_name || 'User'}</span>
                     </Link>
                     <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <i className="fas fa-sign-out-alt"></i> ĐĂNG XUẤT
                     </button>
                  </div>
               ) : (
                  <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '13px', letterSpacing: '1px' }}>SIGN IN</Link>
               )}
               <button onClick={() => navigate('/rooms')} className="btn-gold" style={{ padding: '12px 25px', fontSize: '11px' }}>BOOK NOW</button>
            </div>
          </div>
        </header>
      )}

      {/* MAIN CONTENT - NO PADDING IF ADMIN */}
      <main style={{ flex: 1, paddingTop: (isHome || isAdmin) ? '0' : '80px' }}>
        {children}
      </main>

      {/* LUXURY FOOTER - HIDE ON ADMIN */}
      {!isAdmin && (
        <footer style={{ background: '#0a0f1d', color: '#fff', padding: '100px 0 50px', borderTop: '1px solid rgba(196, 166, 97, 0.2)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: '60px', marginBottom: '80px' }}>
              <div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--gold)', margin: 0, letterSpacing: '2px' }}>BOOKING X</h3>
                 </div>
                 <p style={{ opacity: 0.6, lineHeight: '1.8', fontSize: '14px' }}>Nơi hội tụ của sự sang trọng và tinh tế. Chúng tôi mang đến những trải nghiệm nghỉ dưỡng đẳng cấp quốc tế tại trung tâm thành phố biển Đà Nẵng.</p>
                 <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                    <SocialIcon icon="fab fa-facebook-f" />
                    <SocialIcon icon="fab fa-instagram" />
                    <SocialIcon icon="fab fa-twitter" />
                 </div>
              </div>
              <div>
                 <FooterTitle label="Quick Links" />
                 <FooterLink to="/rooms" label="Luxury Rooms" />
                 <FooterLink to="/gallery" label="Photo Gallery" />
                 <FooterLink to="/about" label="Our Story" />
                 <FooterLink to="/blog" label="Travel Blog" />
              </div>
              <div>
                 <FooterTitle label="Services" />
                 <FooterLink to="/" label="Spa & Wellness" />
                 <FooterLink to="/" label="Fine Dining" />
                 <FooterLink to="/" label="Infinity Pool" />
                 <FooterLink to="/" label="Events" />
              </div>
              <div>
                 <FooterTitle label="Newsletter" />
                 <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: '20px' }}>Nhận thông tin ưu đãi mới nhất từ chúng tôi.</p>
                 <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '5px', border: '1px solid rgba(196, 166, 97, 0.2)' }}>
                    <input type="text" placeholder="Email Address" style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '10px', outline: 'none' }} />
                    <button style={{ background: 'var(--gold)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>JOIN</button>
                 </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px', textAlign: 'center', fontSize: '12px', opacity: 0.4 }}>
               &copy; 2026 BOOKING X LUXURY RESORT. ALL RIGHTS RESERVED.
            </div>
          </div>
        </footer>
      )}
      {!isAdmin && <Chatbot />}
    </div>
  );
}

function NavLink({ to, label, style = {} }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', color: '#fff', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', opacity: 0.8, transition: '0.3s', ...style }} onMouseEnter={e => e.target.style.color = 'var(--gold)'} onMouseLeave={e => e.target.style.color = style.color || '#fff'}>
       {label}
    </Link>
  );
}

function FooterTitle({ label }) {
  return <h4 style={{ color: '#fff', fontWeight: '800', marginBottom: '25px', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '2px' }}>{label}</h4>;
}

function FooterLink({ to, label }) {
  return <Link to={to} style={{ display: 'block', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '15px', fontSize: '14px', transition: '0.3s' }} onMouseEnter={e => e.target.style.color = 'var(--gold)'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>{label}</Link>;
}

function SocialIcon({ icon }) {
  return (
    <div style={{ width: '35px', height: '35px', borderRadius: '50%', border: '1px solid rgba(196, 166, 97, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: '0.3s' }} onMouseEnter={e => {e.target.style.background = 'var(--gold)'; e.target.style.color = '#fff'}}>
       <i className={icon} style={{ fontSize: '14px' }}></i>
    </div>
  );
}
