import { useEffect, useState } from 'react';
import { api } from '../api/client';
import EInvoiceModal from '../components/EInvoiceModal';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');

  const load = async () => {
    try {
        const params = new URLSearchParams();
        if (filter !== 'ALL') params.set('status', filter);
        if (search.trim()) params.set('search', search.trim());
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);
        if (createdFrom) params.set('createdFrom', createdFrom);
        if (createdTo) params.set('createdTo', createdTo);

        const queryString = params.toString();
        const data = await api(`/admin/bookings${queryString ? `?${queryString}` : ''}`);
        setBookings(data);
    } catch (error) {
        console.error('Lỗi tải đơn hàng:', error);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, action) => {
    try {
        let endpoint = action === 'cancel' ? `/bookings/${id}/cancel` : `/admin/bookings/${id}/${action}`;
        await api(endpoint, { method: 'PATCH' });
        load();
        if (selectedBooking && selectedBooking.id === id) {
            setSelectedBooking(null);
        }
    } catch (error) {
        alert('Lỗi thực hiện tác vụ: ' + error.message);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'ALL' || b.status === filter;
    const customerName = (b.full_name || '').toLowerCase();
    const searchValue = search.toLowerCase();
    const matchesSearch = !searchValue ||
                          customerName.includes(searchValue) || 
                          b.email?.toLowerCase().includes(searchValue) ||
                          b.phone?.includes(search) ||
                          b.booking_code?.toLowerCase().includes(searchValue);
    return matchesFilter && matchesSearch;
  });

  const [visibleCount, setVisibleCount] = useState(10);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);

  // Reset pagination when search/filters change
  useEffect(() => {
    setVisibleCount(10);
    setIsScrollingLoading(false);
  }, [filter, search, dateFrom, dateTo, createdFrom, createdTo]);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingLoading || visibleCount >= filteredBookings.length) return;
      
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
  }, [isScrollingLoading, visibleCount, bookings.length, filter, search, dateFrom, dateTo]);

  const resetFilters = async () => {
    setFilter('ALL');
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setCreatedFrom('');
    setCreatedTo('');
    try {
      const data = await api('/admin/bookings');
      setBookings(data);
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return { color: '#f59e0b', bg: '#fef3c7' };
      case 'CONFIRMED': return { color: '#0ea5e9', bg: '#e0f2fe' };
      case 'CHECKED_IN': return { color: '#8b5cf6', bg: '#ede9fe' };
      case 'COMPLETED': return { color: '#10b981', bg: '#dcfce7' };
      case 'CANCELLED': return { color: '#ef4444', bg: '#fee2e2' };
      case 'EXPIRED': return { color: '#64748b', bg: '#f1f5f9' };
      default: return { color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'CHECKED_IN': return 'Đã nhận phòng';
      case 'COMPLETED': return 'Hoàn tất';
      case 'CANCELLED': return 'Đã hủy';
      case 'EXPIRED': return 'Hết hạn';
      default: return status;
    }
  };

  const formatDate = (dateStr) => {
      if (!dateStr) return 'n/a';
      return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quản lý đơn đặt phòng</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Theo dõi và xử lý toàn bộ các đơn đặt phòng từ khách hàng.</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        
        {/* Tier 1: Main Search & Status */}
        <div style={{ padding: '20px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', flex: '1', minWidth: '300px', gap: '12px' }}>
            <div style={{ position: 'relative', flex: '1' }}>
              <i className="fas fa-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
              <input 
                type="text" 
                placeholder="Tìm tên khách hàng, email, SĐT hoặc mã booking..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', transition: 'all 0.3s' }} 
              />
            </div>
            
            <div style={{ width: '220px' }}>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', cursor: 'pointer', background: '#fff' }}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="CHECKED_IN">Đã nhận phòng</option>
                <option value="COMPLETED">Hoàn tất</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="EXPIRED">Hết hạn</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={load} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-filter"></i> Lọc kết quả
            </button>
            <button onClick={resetFilters} style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              Đặt lại
            </button>
          </div>

        </div>

        {/* Tier 2: Advanced Date Filters */}
        <div style={{ padding: '15px 24px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Lưu trú từ</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Lưu trú đến</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Tạo từ lúc</label>
            <input type="datetime-local" value={createdFrom} onChange={e => setCreatedFrom(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Tạo đến lúc</label>
            <input type="datetime-local" value={createdTo} onChange={e => setCreatedTo(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} />
          </div>
        </div>

        {/* Responsive Table Scroll Wrap */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1050px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Mã booking</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Khách hàng</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Phòng</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Thời gian</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Tổng tiền</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Trạng thái</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.slice(0, visibleCount).map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '700', color: '#0ea5e9' }}>{b.booking_code}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '600' }}>{b.full_name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{b.email}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '500' }}>{b.room_number}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{b.room_type_name}</div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px' }}>
                      {formatDate(b.check_in_date)} - {formatDate(b.check_out_date)}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: '700' }}>{Number(b.total_amount).toLocaleString()}đ</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      color: getStatusColor(b.status).color, 
                      backgroundColor: getStatusColor(b.status).bg,
                      padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                    }}>
                      {getStatusLabel(b.status)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => setSelectedBooking(b)} style={{ border: '1px solid #ddd', background: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Xem</button>
                      {b.status === 'PENDING' && (
                        <button onClick={() => handleAction(b.id, 'confirm')} style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Xác nhận</button>
                      )}
                      {b.status === 'CONFIRMED' && (
                          <button onClick={() => handleAction(b.id, 'check-in')} style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Check-in</button>
                      )}
                      {b.status === 'CHECKED_IN' && (
                          <button onClick={() => handleAction(b.id, 'check-out')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Check-out</button>
                      )}
                      {['PENDING', 'CONFIRMED'].includes(b.status) && (
                        <button onClick={() => { if (window.confirm('Bạn có chắc chắn muốn hủy đơn đặt phòng này?')) handleAction(b.id, 'cancel'); }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Hủy đơn</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {isScrollingLoading && (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div className="skeleton-pulse" style={{ width: '80px', height: '18px' }}></div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div className="skeleton-pulse" style={{ width: '120px', height: '14px', marginBottom: '6px' }}></div>
                      <div className="skeleton-pulse" style={{ width: '150px', height: '12px' }}></div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div className="skeleton-pulse" style={{ width: '40px', height: '14px', marginBottom: '6px' }}></div>
                      <div className="skeleton-pulse" style={{ width: '100px', height: '12px' }}></div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div className="skeleton-pulse" style={{ width: '160px', height: '14px' }}></div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div className="skeleton-pulse" style={{ width: '90px', height: '16px' }}></div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div className="skeleton-pulse" style={{ width: '80px', height: '24px', borderRadius: '20px' }}></div>
                    </td>
                    <td style={{ padding: '16px 24px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <div className="skeleton-pulse" style={{ width: '50px', height: '28px', borderRadius: '6px' }}></div>
                      <div className="skeleton-pulse" style={{ width: '50px', height: '28px', borderRadius: '6px' }}></div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', width: '550px', borderRadius: '16px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Chi tiết đặt phòng {selectedBooking.booking_code}</h3>
              <button onClick={() => setSelectedBooking(null)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                    <label style={{ fontSize: '12px', color: '#64748b' }}>KHÁCH HÀNG</label>
                    <div style={{ fontWeight: '600' }}>{selectedBooking.full_name}</div>
                    <div>{selectedBooking.email}</div>
                    <div>{selectedBooking.phone}</div>
                </div>
                <div>
                    <label style={{ fontSize: '12px', color: '#64748b' }}>TRẠNG THÁI & THANH TOÁN</label>
                    <div>{getStatusLabel(selectedBooking.status)}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textTransform: 'uppercase' }}>Hình thức</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                        {selectedBooking.payment_method === 'CASH' ? 'Thanh toán tại quầy' : selectedBooking.payment_method === 'VNPAY' ? 'VNPay / Chuyển khoản' : selectedBooking.payment_method}
                    </div>
                    <div style={{ fontWeight: '700', color: '#0ea5e9', fontSize: '18px', marginTop: '8px' }}>
                        {Number(selectedBooking.total_amount).toLocaleString()}đ
                    </div>
                </div>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Phòng:</span>
                    <span style={{ fontWeight: '600' }}>{selectedBooking.room_number} ({selectedBooking.room_type_name})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Nhận phòng:</span>
                    <span style={{ fontWeight: '600' }}>{formatDate(selectedBooking.check_in_date)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Trả phòng:</span>
                    <span style={{ fontWeight: '600' }}>{formatDate(selectedBooking.check_out_date)}</span>
                </div>
                {selectedBooking.voucher_pdf_url && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px' }}>
                        <span>Voucher PDF:</span>
                        <a href={`http://localhost:5000${selectedBooking.voucher_pdf_url}`} target="_blank" rel="noreferrer" style={{ fontWeight: '700', color: '#8b5cf6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <i className="fas fa-file-pdf"></i> Xem / Tải về PDF
                        </a>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              {['CONFIRMED', 'CHECKED_IN', 'COMPLETED'].includes(selectedBooking.status) && (
                <button 
                  onClick={() => setInvoiceBooking({
                    ...selectedBooking,
                    customer_name: selectedBooking.full_name,
                    customer_phone: selectedBooking.phone,
                    identity_number: selectedBooking.identity_number,
                    address: selectedBooking.address
                  })} 
                  style={{ 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    border: selectedBooking.status === 'COMPLETED' ? '2px solid var(--gold)' : '2px solid #0ea5e9', 
                    background: 'transparent', 
                    color: selectedBooking.status === 'COMPLETED' ? 'var(--gold)' : '#0ea5e9', 
                    fontWeight: '800', 
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: '0.3s'
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.backgroundColor = selectedBooking.status === 'COMPLETED' ? 'var(--gold)' : '#0ea5e9'; 
                    e.currentTarget.style.color = '#fff'; 
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.backgroundColor = 'transparent'; 
                    e.currentTarget.style.color = selectedBooking.status === 'COMPLETED' ? 'var(--gold)' : '#0ea5e9'; 
                  }}
                >
                  <i className={selectedBooking.status === 'COMPLETED' ? "fas fa-file-signature" : "fas fa-receipt"} style={{ fontSize: '15px' }}></i> {selectedBooking.status === 'COMPLETED' ? 'Xuất hóa đơn đỏ' : 'Xuất phiếu tạm tính'}
                </button>
              )}
              {['PENDING', 'CONFIRMED'].includes(selectedBooking.status) && (
                <button onClick={() => { if (window.confirm('Bạn có chắc chắn muốn hủy đơn đặt phòng này?')) { handleAction(selectedBooking.id, 'cancel'); setSelectedBooking(null); } }} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Hủy đơn</button>
              )}
              {['CONFIRMED', 'CHECKED_IN', 'COMPLETED'].includes(selectedBooking.status) && (
                <button 
                  onClick={async () => {
                    try {
                      const res = await api(`/admin/bookings/${selectedBooking.id}/resend-voucher`, { method: 'POST' });
                      alert(res.message || 'Đã gửi lại Voucher PDF qua Gmail thành công.');
                      load();
                      // Refresh selectedBooking to reflect updated voucher_pdf_url
                      const freshData = await api(`/admin/bookings`);
                      const updated = freshData.find(b => b.id === selectedBooking.id);
                      if (updated) setSelectedBooking(updated);
                    } catch (err) {
                      alert(err.message || 'Không thể gửi email. Vui lòng kiểm tra cấu hình Gmail SMTP.');
                    }
                  }}
                  style={{
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    border: '2px solid #8b5cf6', 
                    background: 'transparent', 
                    color: '#8b5cf6', 
                    fontWeight: '800', 
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: '0.3s'
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.backgroundColor = '#8b5cf6'; 
                    e.currentTarget.style.color = '#fff'; 
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.backgroundColor = 'transparent'; 
                    e.currentTarget.style.color = '#8b5cf6'; 
                  }}
                >
                  <i className="fas fa-paper-plane" style={{ fontSize: '15px' }}></i> Gửi lại Voucher
                </button>
              )}
              <button onClick={() => setSelectedBooking(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {invoiceBooking && (
        <EInvoiceModal booking={invoiceBooking} onClose={() => setInvoiceBooking(null)} />
      )}
    </div>
  );
}
