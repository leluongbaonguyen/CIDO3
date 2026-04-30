import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    occupancyRate: 0,
    totalCustomers: 0,
    monthlyRevenue: []
  });

  const loadStats = async () => {
    try {
      const data = await api('/admin/dashboard');
      setStats(data);
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    }
  };

  useEffect(() => { loadStats(); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Bảng điều khiển tổng quan</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Dữ liệu kinh doanh thời gian thực từ hệ thống XTravel.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <MetricCard title="Tổng doanh thu" value={`${Number(stats.totalRevenue).toLocaleString()} ₫`} icon="fa-wallet" color="#0ea5e9" trend="Thực tế" />
        <MetricCard title="Đơn đặt phòng" value={stats.totalBookings} icon="fa-calendar-check" color="#10b981" trend="Tất cả" />
        <MetricCard title="Tỷ lệ lấp đầy" value={`${stats.occupancyRate}%`} icon="fa-bed" color="#f59e0b" trend="Hiện tại" />
        <MetricCard title="Khách hàng" value={stats.totalCustomers} icon="fa-users" color="#8b5cf6" trend="Thành viên" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Doanh thu 6 tháng gần nhất</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '0 20px' }}>
            {stats.monthlyRevenue.length > 0 ? stats.monthlyRevenue.map((item, i) => (
              <div key={i} style={{ flex: 1, backgroundColor: '#0ea5e9', height: `${Math.min(100, (item.total / (stats.totalRevenue || 1)) * 500)}%`, minHeight: '10%', borderRadius: '4px 4px 0 0', opacity: 0.8, position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{item.month}</div>
                <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: '600', color: '#1e293b' }}>{Math.round(item.total/1000000)}M</div>
              </div>
            )) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>Chưa có dữ liệu hàng tháng</div>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Phân bổ trạng thái</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: `conic-gradient(#0ea5e9 0% ${stats.occupancyRate}%, #e2e8f0 ${stats.occupancyRate}% 100%)`, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
               <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '700', fontSize: '24px', color: '#1e293b' }}>
                 {stats.occupancyRate}%
               </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <LegendItem color="#0ea5e9" label="Phòng đang sử dụng" value={`${stats.occupancyRate}%`} />
            <LegendItem color="#e2e8f0" label="Phòng còn trống" value={`${100 - stats.occupancyRate}%`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color, trend }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${color}15`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: color }}>
          <i className={`fas ${icon}`} style={{ fontSize: '20px' }}></i>
        </div>
        <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', textTransform: 'uppercase' }}>
          {trend}
        </span>
      </div>
      <div>
        <h4 style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', marginBottom: '4px', margin: 0 }}>{title}</h4>
        <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{value}</div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }}></div>
        <span style={{ fontSize: '14px', color: '#64748b' }}>{label}</span>
      </div>
      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{value}</span>
    </div>
  );
}
