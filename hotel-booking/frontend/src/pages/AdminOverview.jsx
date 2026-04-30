import { useState } from 'react';

export default function AdminOverview() {
  const [period, setPeriod] = useState('Month');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header with Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Bảng điều khiển tổng quan</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Chào mừng trở lại! Đây là tóm tắt hoạt động kinh doanh của bạn.</p>
        </div>
        
        <div style={{ display: 'flex', backgroundColor: '#fff', borderRadius: '8px', padding: '4px', border: '1px solid #e2e8f0' }}>
          {['Week', 'Month', 'Year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: period === p ? '#0ea5e9' : 'transparent',
                color: period === p ? '#fff' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              {p === 'Week' ? 'Tuần' : p === 'Month' ? 'Tháng' : 'Năm'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <MetricCard title="Tổng doanh thu" value="1.250.000.000 ₫" icon="fa-wallet" color="#0ea5e9" trend="+12.5%" />
        <MetricCard title="Đơn đặt phòng" value="156" icon="fa-calendar-check" color="#10b981" trend="+8.2%" />
        <MetricCard title="Phòng đang ở" value="42/50" icon="fa-bed" color="#f59e0b" trend="84%" />
        <MetricCard title="Khách hàng mới" value="1,240" icon="fa-users" color="#8b5cf6" trend="+15%" />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Revenue Line Chart (Simulated) */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Biểu đồ doanh thu</h3>
            <i className="fas fa-ellipsis-h" style={{ color: '#94a3b8', cursor: 'pointer' }}></i>
          </div>
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '0 20px' }}>
            {/* Simulated bar/line chart bars */}
            {[40, 60, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
              <div key={i} style={{ flex: 1, backgroundColor: '#0ea5e9', height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: 0.8, position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#94a3b8' }}>T{i+1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Occupancy Pie Chart (Simulated) */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Tỷ lệ lấp đầy</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'conic-gradient(#0ea5e9 0% 65%, #10b981 65% 85%, #f59e0b 85% 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
               <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '700', fontSize: '24px', color: '#1e293b' }}>
                 84%
               </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <LegendItem color="#0ea5e9" label="Phòng Suite" value="65%" />
            <LegendItem color="#10b981" label="Phòng Deluxe" value="20%" />
            <LegendItem color="#f59e0b" label="Phòng Standard" value="15%" />
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
        <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px', backgroundColor: trend.includes('+') ? '#dcfce7' : '#fef3c7', color: trend.includes('+') ? '#166534' : '#92400e' }}>
          {trend}
        </span>
      </div>
      <div>
        <h4 style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', marginBottom: '4px', margin: 0 }}>{title}</h4>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{value}</div>
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
