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

  // Mapping tiêu đề breadcrumb
  const getPageTitle = () => {
    if (path === '/admin') return 'Bảng điều khiển';
    if (path.includes('bookings')) return 'Danh sách đơn hàng';
    if (path.includes('booking/new')) return 'Tạo đơn hàng mới';
    if (path.includes('rooms')) return 'Quản lý phòng nghỉ';
    if (path.includes('room-types')) return 'Hạng phòng niêm yết';
    if (path.includes('amenities')) return 'Quản lý tiện nghi';
    if (path.includes('customers')) return 'Thông tin khách hàng';
    if (path.includes('employees')) return 'Danh sách nhân viên';
    if (path.includes('roles')) return 'Phân quyền hệ thống';
    if (path.includes('reviews')) return 'Đánh giá từ khách';
    if (path.includes('support')) return 'Trung tâm hỗ trợ';
    return 'Chi tiết hệ thống';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* 1. EXECUTIVE ADMIN SIDEBAR */}
      <aside style={{ 
        width: '280px', backgroundColor: '#0a0f1d', color: '#94a3b8', 
        display: 'flex', flexDirection: 'column', position: 'fixed', 
        height: '100vh', zIndex: 100, borderRight: '1px solid rgba(196, 166, 97, 0.2)',
        boxShadow: '10px 0 30px rgba(0,0,0,0.2)'
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '30px 24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/logo.png" alt="BOOKING X" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <span style={{ fontSize: '22px', fontWeight: '900', color: '#fff', letterSpacing: '2px', fontFamily: 'Playfair Display', lineHeight: '1.2' }}>BOOKING X</span>
             <span style={{ fontSize: '8px', fontWeight: '800', color: 'var(--gold)', letterSpacing: '3px', textTransform: 'uppercase' }}>Luxury Hotel Booking</span>
          </div>
        </div>

        {/* Navigation Scroll Area */}
        <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '2px', padding: '24px 16px 12px' }}>Chính</div>
          
          <SidebarLink to="/admin" icon="fa-th-large" label="Bảng điều khiển" active={path === '/admin'} />

          <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '2px', padding: '24px 16px 12px' }}>Vận hành</div>
          
          {/* Collapsible: Bookings */}
          <SidebarGroup 
            icon="fa-calendar-check" label="Đơn đặt phòng" 
            expanded={expanded.bookings} onToggle={() => toggle('bookings')}
            active={path.includes('booking')}
          >
            <SidebarSubLink to="/admin/bookings" label="Danh sách đơn" active={path.endsWith('bookings')} />
            <SidebarSubLink to="/admin/booking/new" label="Tạo đơn mới" active={path.includes('new')} />
          </SidebarGroup>

          {/* Collapsible: Rooms */}
          <SidebarGroup 
            icon="fa-bed" label="Quản lý phòng" 
            expanded={expanded.rooms} onToggle={() => toggle('rooms')}
            active={path.includes('room')}
          >
            <SidebarSubLink to="/admin/rooms" label="Danh sách phòng" active={path.endsWith('rooms')} />
            <SidebarSubLink to="/admin/room-types" label="Loại phòng" active={path.includes('room-types')} />
            <SidebarSubLink to="/admin/amenities" label="Tiện nghi" active={path.includes('amenities')} />
          </SidebarGroup>

          <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '2px', padding: '24px 16px 12px' }}>Hệ thống</div>

          {/* Collapsible: Users */}
          <SidebarGroup 
            icon="fa-users-cog" label="Người dùng" 
            expanded={expanded.users} onToggle={() => toggle('users')}
            active={path.includes('customer') || path.includes('employee')}
          >
            <SidebarSubLink to="/admin/customers" label="Khách hàng" active={path.includes('customers')} />
            {user?.role === 'ADMIN' && (
              <>
                <SidebarSubLink to="/admin/employees" label="Nhân viên" active={path.includes('employees')} />
                <SidebarSubLink to="/admin/roles" label="Phân quyền" active={path.includes('roles')} />
              </>
            )}
          </SidebarGroup>

          <SidebarLink to="/admin/reviews" icon="fa-star" label="Đánh giá" active={path.includes('reviews')} />
          <SidebarLink to="/admin/support" icon="fa-comments" label="Hỗ trợ" active={path.includes('support')} />
        </nav>

        {/* Sidebar Footer User Profile */}
        <div style={{ padding: '24px', background: 'rgba(196, 166, 97, 0.05)', borderTop: '1px solid rgba(196, 166, 97, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', color: '#0a0f1d', fontSize: '18px', border: '3px solid rgba(255,255,255,0.1)' }}>
              {(user?.firstName || user?.first_name || 'A')[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName || user?.first_name || 'Administrator'}</div>
              <div style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{user?.role || 'Staff'}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', padding: '12px', borderRadius: '12px', 
              background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', 
              color: '#ef4444', fontWeight: '800', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: '0.3s', fontSize: '12px', letterSpacing: '1px'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
          >
             <i className="fas fa-power-off"></i> ĐĂNG XUẤT HỆ THỐNG
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column' }}>
        {/* Top Premium Header */}
        <header style={{ 
          height: '90px', background: '#fff', 
          borderBottom: '1px solid #f1f5f9', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '0 40px', position: 'sticky', top: 0, zIndex: 90,
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#64748b' }}>
             <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <i className="fas fa-home" style={{ fontSize: '14px' }}></i>
             </div>
             <div style={{ fontSize: '14px', fontWeight: '600' }}>
                Hệ thống Quản trị <i className="fas fa-chevron-right" style={{ margin: '0 10px', fontSize: '10px', opacity: 0.5 }}></i> 
                <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{getPageTitle()}</span>
             </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
             <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '50px', padding: '4px 20px', alignItems: 'center', gap: '12px' }}>
                <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
                <input type="text" placeholder="Tìm kiếm hệ thống..." style={{ background: 'transparent', border: 'none', padding: '8px 0', width: '200px', fontSize: '13px', outline: 'none' }} />
             </div>
             <div style={{ position: 'relative', cursor: 'pointer' }}>
                <i className="far fa-bell" style={{ fontSize: '20px', color: 'var(--primary)' }}></i>
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 5px', borderRadius: '10px', border: '2px solid #fff' }}>5</span>
             </div>
             <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-power-off"></i> ĐĂNG XUẤT
             </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main style={{ padding: '40px', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label, active }) {
  return (
    <Link to={to} style={{ 
      display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', 
      color: active ? '#fff' : '#94a3b8', 
      backgroundColor: active ? 'rgba(255,255,255,0.05)' : 'transparent', 
      borderRadius: '12px', textDecoration: 'none', marginBottom: '4px', 
      fontWeight: active ? '700' : '600', fontSize: '14px',
      borderLeft: active ? '4px solid var(--accent)' : '4px solid transparent',
      transition: 'all 0.3s'
    }}>
      <i className={`fas ${icon}`} style={{ width: '20px', fontSize: '16px', color: active ? 'var(--accent)' : 'inherit' }}></i>
      <span>{label}</span>
    </Link>
  );
}

function SidebarGroup({ icon, label, expanded, onToggle, active, children }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      <div onClick={onToggle} style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '14px 16px', cursor: 'pointer', borderRadius: '12px', 
        color: active ? '#fff' : '#94a3b8', transition: 'all 0.3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <i className={`fas ${icon}`} style={{ width: '20px', fontSize: '16px', color: active ? 'var(--accent)' : 'inherit' }}></i>
          <span style={{ fontWeight: '600', fontSize: '14px' }}>{label}</span>
        </div>
        <i className={`fas fa-chevron-${expanded ? 'down' : 'right'}`} style={{ fontSize: '10px' }}></i>
      </div>
      {expanded && (
        <div style={{ padding: '8px 0 8px 48px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SidebarSubLink({ to, label, active }) {
  return (
    <Link to={to} style={{ 
      color: active ? 'var(--accent)' : '#64748b', 
      textDecoration: 'none', fontSize: '13.5px', fontWeight: active ? '700' : '500',
      transition: 'all 0.2s'
    }}>
      {label}
    </Link>
  );
}
