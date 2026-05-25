import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalRooms: 0,
    occupancyRate: 0,
    totalCustomers: 0,
    monthlyRevenue: [],
    todayRevenue: 0,
    todayBookings: 0,
    todayCustomers: 0,
    dailyRevenue: []
  });
  const [viewMode, setViewMode] = useState('month'); // 'day' | 'month'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async (isSilent = false) => {
      try {
        if (!isSilent) setError(null);
        const data = await api('/admin/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Lỗi tải thống kê:', error);
        if (!isSilent) setError(error.message);
      } finally {
        if (!isSilent) setLoading(false);
      }
    };
    fetchStats();

    // Auto-update dashboard metrics silently every 5 seconds!
    const intervalId = setInterval(() => {
      fetchStats(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);



  if (error) return (
    <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#fee2e2', borderRadius: '16px', border: '1px solid #ef4444' }}>
       <i className="fas fa-exclamation-triangle" style={{ fontSize: '40px', color: '#ef4444' }}></i>
       <h3 style={{ marginTop: '20px', color: '#991b1b' }}>Lỗi truy xuất dữ liệu</h3>
       <p style={{ color: '#b91c1c', marginBottom: '20px' }}>{error}</p>
       <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>THỬ LẠI</button>
       <p style={{ marginTop: '15px', fontSize: '13px' }}>Nếu lỗi là "Invalid token", vui lòng <b>Đăng xuất</b> và <b>Đăng nhập lại</b>.</p>
    </div>
  );

  const handleSeed = async () => {
    if (!window.confirm('Bạn có muốn nạp dữ liệu chuẩn (100 phòng, 3 loại tài khoản) vào hệ thống không?')) return;
    try {
        setLoading(true);
        const res = await api('/admin/seed-data');
        alert(res.message);
        window.location.reload();
    } catch (error) {
        alert('Lỗi nạp dữ liệu: ' + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px' }}>Hệ Thống Đang Vận Hành Ổn Định</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Dữ liệu tổng hợp từ toàn bộ chuỗi resort BOOKING X.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* View Mode Toggle Switch */}
            <div style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginRight: '8px'
            }}>
              <button 
                onClick={() => setViewMode('month')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'month' ? '#fff' : 'transparent',
                  color: viewMode === 'month' ? 'var(--primary)' : '#64748b',
                  boxShadow: viewMode === 'month' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <i className="fas fa-chart-bar" style={{ marginRight: '6px' }}></i> Báo cáo Tháng
              </button>
              <button 
                onClick={() => setViewMode('day')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'day' ? '#fff' : 'transparent',
                  color: viewMode === 'day' ? 'var(--primary)' : '#64748b',
                  boxShadow: viewMode === 'day' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <i className="fas fa-calendar-day" style={{ marginRight: '6px' }}></i> Báo cáo Ngày
              </button>
            </div>

           {stats.totalRooms === 0 && (
             <button onClick={handleSeed} className="btn-gold" style={{ padding: '10px 20px', fontSize: '13px' }}>
               <i className="fas fa-database" style={{ marginRight: '8px' }}></i> KHỞI TẠO DỮ LIỆU CHUẨN
             </button>
           )}
           <div className="glass-effect" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
              <i className="far fa-calendar-alt" style={{ marginRight: '8px' }}></i> {new Date().toLocaleDateString('vi-VN')}
           </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', marginBottom: '40px' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: 'var(--shadow-premium)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div className="skeleton-pulse" style={{ width: '56px', height: '56px', borderRadius: '16px' }}></div>
                  <div className="skeleton-pulse" style={{ width: '60px', height: '14px' }}></div>
               </div>
               <div className="skeleton-pulse" style={{ width: '120px', height: '15px', marginBottom: '8px' }}></div>
               <div className="skeleton-pulse" style={{ width: '160px', height: '28px' }}></div>
            </div>
          ))
        ) : (
          <>
            <MetricCard 
              title={viewMode === 'month' ? "Doanh thu thực" : "Doanh thu hôm nay"} 
              value={viewMode === 'month' ? `${Number(stats.totalRevenue).toLocaleString()} ₫` : `${Number(stats.todayRevenue).toLocaleString()} ₫`} 
              icon="fa-wallet" 
              color="#D4AF37" 
              trend={viewMode === 'month' ? "+15% v/s 2025" : "Hôm nay"} 
            />
            <MetricCard 
              title={viewMode === 'month' ? "Tổng Booking" : "Booking hôm nay"} 
              value={viewMode === 'month' ? stats.totalBookings : stats.todayBookings} 
              icon="fa-calendar-check" 
              color="#D4AF37" 
              trend={viewMode === 'month' ? "Tăng trưởng" : "Cập nhật trực tiếp"} 
            />
            <MetricCard title="Tỷ lệ lấp đầy" value={`${stats.occupancyRate}%`} icon="fa-bed" color="#D4AF37" trend="Cao điểm" />
            <MetricCard 
              title={viewMode === 'month' ? "Khách hàng mới" : "Đăng ký hôm nay"} 
              value={viewMode === 'month' ? stats.totalCustomers : stats.todayCustomers} 
              icon="fa-users" 
              color="#D4AF37" 
              trend={viewMode === 'month' ? "+12 hôm nay" : "Khách mới"} 
            />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Revenue Chart Widget */}
        <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-premium)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
             <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
                {viewMode === 'month' ? "Thống kê doanh thu (VNĐ)" : "Thống kê doanh thu theo ngày (VNĐ)"}
             </h3>
             <div style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '14px' }}>
                {viewMode === 'month' ? `Năm ${new Date().getFullYear()}` : "7 ngày vừa qua"}
             </div>
          </div>
          <div style={{ height: '350px', display: 'flex', alignItems: 'flex-end', gap: '24px', padding: '0 10px', borderBottom: '2px solid #f1f5f9' }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '10px' }}>
                  <div className="skeleton-pulse" style={{ width: '100%', height: `${30 + idx * 10}%`, borderRadius: '8px 8px 0 0' }}></div>
                  <div className="skeleton-pulse" style={{ width: '60%', height: '12px', margin: '0 auto' }}></div>
                </div>
              ))
            ) : (() => {
              const currentChartData = viewMode === 'month' ? stats.monthlyRevenue : stats.dailyRevenue;
              if (currentChartData && currentChartData.length > 0) {
                const maxVal = Math.max(...currentChartData.map(m => m.total));
                return currentChartData.map((item, i) => {
                  const heightPercent = maxVal > 0 ? Math.max(5, (item.total / (maxVal * 1.2)) * 100) : 5;
                  return (
                    <div key={i} style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div style={{ 
                        background: 'var(--gold-gradient)', 
                        width: viewMode === 'month' ? '45px' : '30px',
                        margin: '0 auto',
                        height: `${heightPercent}%`, 
                        borderRadius: '8px 8px 0 0', 
                        position: 'relative',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                        transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}>
                         <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: '800', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                            {viewMode === 'month' 
                              ? `${Math.round(item.total/1000000)}M` 
                              : (item.total >= 1000000 ? `${(item.total/1000000).toFixed(1)}M` : `${Number(item.total).toLocaleString()}đ`)
                            }
                         </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                         {viewMode === 'month' ? (() => {
                           if (!item.month || !item.month.includes('-')) return item.month;
                           const [year, month] = item.month.split('-');
                           return `Tháng ${parseInt(month)}/${year}`;
                         })() : item.day}
                      </div>
                    </div>
                  );
                });
              } else {
                return (
                  <div style={{ width: '100%', textAlign: 'center', paddingBottom: '150px', color: '#94a3b8' }}>
                     Chưa có dữ liệu doanh thu trong thời gian này
                  </div>
                );
              }
            })()}
          </div>
        </div>

        {/* Occupancy Donut Widget */}
        <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-premium)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '32px' }}>Trạng thái vận hành</h3>
          {loading ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
                <div className="skeleton-pulse" style={{ width: '200px', height: '200px', borderRadius: '50%' }}></div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   <div className="skeleton-pulse" style={{ width: '100%', height: '40px', borderRadius: '12px' }}></div>
                   <div className="skeleton-pulse" style={{ width: '100%', height: '40px', borderRadius: '12px' }}></div>
                </div>
             </div>
          ) : (
             <>
               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                 <div style={{ 
                   width: '200px', height: '200px', borderRadius: '50%', 
                   background: `conic-gradient(#D4AF37 0% ${stats.occupancyRate}%, #f1f5f9 ${stats.occupancyRate}% 100%)`, 
                   display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
                   boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)'
                 }}>
                    <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--primary)' }}>{stats.occupancyRate}%</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>CÓ KHÁCH</span>
                    </div>
                 </div>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <LegendItem color="#D4AF37" label="Đang phục vụ" value={`${stats.occupancyRate}%`} />
                 <LegendItem color="#f1f5f9" label="Sẵn sàng đón khách" value={`${100 - stats.occupancyRate}%`} />
               </div>
             </>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color, trend }) {
  return (
    <div style={{ 
      backgroundColor: '#fff', padding: '32px', borderRadius: '24px', 
      border: '1px solid #f1f5f9', boxShadow: 'var(--shadow-premium)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: `${color}10`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: color }}>
          <i className={`fas ${icon}`} style={{ fontSize: '24px' }}></i>
        </div>
        <div style={{ fontSize: '12px', fontWeight: '700', color: color === '#10b981' ? '#10b981' : 'var(--text-muted)' }}>
          {trend}
        </div>
      </div>
      <div>
        <h4 style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>{title}</h4>
        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px' }}>{value}</div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: color }}></div>
        <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>{label}</span>
      </div>
      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>{value}</span>
    </div>
  );
}
