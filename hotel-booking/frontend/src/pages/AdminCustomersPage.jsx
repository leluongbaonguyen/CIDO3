import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);

  const load = async () => {
    try {
        const data = await api('/admin/customers');
        setCustomers(data);
    } catch (error) {
        console.error('Lỗi tải khách hàng:', error);
    }
  };

  useEffect(() => { load(); }, []);

  // Reset pagination when search query changes
  useEffect(() => {
    setVisibleCount(10);
    setIsScrollingLoading(false);
  }, [search]);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingLoading || visibleCount >= filteredCustomers.length) return;
      
      const threshold = 100;
      const totalHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.innerHeight + window.scrollY;
      
      if (totalHeight - scrollPosition < threshold) {
        setIsScrollingLoading(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + 10);
          setIsScrollingLoading(false);
        }, 800);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrollingLoading, visibleCount, customers.length, search]);

  const filteredCustomers = customers.filter(c => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || 
           c.email?.toLowerCase().includes(search.toLowerCase()) ||
           c.phone?.includes(search) ||
           c.id_number?.includes(search);
  });

  const handleToggleStatus = async (id, currentStatus) => {
    try {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await api(`/admin/users/${id}/status`, { method: 'PATCH', body: { status: newStatus } });
        load();
    } catch (error) {
        alert('Lỗi cập nhật trạng thái');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý khách hàng</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Danh sách thành viên đăng ký sử dụng dịch vụ khách sạn.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, SĐT hoặc CMND..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '350px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Khách hàng</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Liên hệ</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>CMND/CCCD</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Địa chỉ</th>
              <th style={{ padding: '16px 24px', textAlign: 'left' }}>Trạng thái</th>
              <th style={{ padding: '16px 24px', textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.slice(0, visibleCount).map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0ea5e9', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                      {(c.first_name || c.full_name || 'C')[0]}
                    </div>
                    <div>
                        <div style={{ fontWeight: '600' }}>{c.full_name || `${c.first_name || ''} ${c.last_name || ''}`}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Gia nhập: {new Date(c.create_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                    <div>{c.email}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{c.phone}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>{c.id_number || 'N/A'}</td>
                <td style={{ padding: '16px 24px' }}>{c.city || 'N/A'}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    backgroundColor: c.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', 
                    color: c.status === 'ACTIVE' ? '#166534' : '#ef4444',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' 
                  }}>
                    {c.status === 'ACTIVE' ? 'Đang hoạt động' : 'Bị khóa'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleToggleStatus(c.user_id, c.status)}
                    style={{ 
                      border: 'none', 
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: '#fff',
                      backgroundColor: c.status === 'ACTIVE' ? '#ef4444' : '#10b981', 
                      cursor: 'pointer', 
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: '0.2s ease-in-out'
                    }} 
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    title={c.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                  >
                    <i className={`fas fa-${c.status === 'ACTIVE' ? 'user-slash' : 'user-check'}`}></i>
                    {c.status === 'ACTIVE' ? 'Khóa' : 'Kích hoạt'}
                  </button>
                </td>
              </tr>
            ))}
            {isScrollingLoading && (
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="skeleton-pulse" style={{ width: '36px', height: '36px', borderRadius: '50%' }}></div>
                      <div>
                          <div className="skeleton-pulse" style={{ width: '120px', height: '14px', marginBottom: '8px' }}></div>
                          <div className="skeleton-pulse" style={{ width: '80px', height: '12px' }}></div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                      <div className="skeleton-pulse" style={{ width: '150px', height: '14px', marginBottom: '8px' }}></div>
                      <div className="skeleton-pulse" style={{ width: '100px', height: '12px' }}></div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                      <div className="skeleton-pulse" style={{ width: '90px', height: '14px' }}></div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                      <div className="skeleton-pulse" style={{ width: '80px', height: '14px' }}></div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                      <div className="skeleton-pulse" style={{ width: '70px', height: '22px', borderRadius: '20px' }}></div>
                  </td>
                  <td style={{ padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
                      <div className="skeleton-pulse" style={{ width: '90px', height: '32px', borderRadius: '8px' }}></div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
