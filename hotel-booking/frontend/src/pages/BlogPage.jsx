import React from 'react';

export default function BlogPage() {
  const blogs = [
    { id: 1, title: 'Top 5 hoạt động không thể bỏ qua khi nghỉ dưỡng tại BOOKING X', date: '20 Th04, 2026', img: '/images/img_6f8ad18268.jpeg' },
    { id: 2, title: 'Cẩm nang thưởng thức ẩm thực tinh túy tại nhà hàng Blue Ocean', date: '15 Th04, 2026', img: '/images/img_3e8afbec1f.jpeg' },
    { id: 3, title: 'Bí quyết đặt phòng giá tốt nhất mùa cao điểm', date: '10 Th04, 2026', img: '/images/img_d31fdb5400.jpeg' }
  ];

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '100px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* FEATURED POST - CẦU RỒNG ĐÀ NẴNG */}
        <div className="animate-up" style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '500px', marginBottom: '80px', boxShadow: '0 30px 60px rgba(0,0,0,0.15)' }}>
           <img src="/images/img_7b0b87cdb2.jpeg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Da Nang" />
           <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '60px' }}>
              <span style={{ background: '#ff5a3d', color: '#fff', padding: '8px 20px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', width: 'fit-content', marginBottom: '20px' }}>KHÁM PHÁ</span>
              <h2 style={{ fontSize: '42px', color: '#fff', fontWeight: '800', maxWidth: '800px', lineHeight: '1.2' }}>Hành trình khám phá vẻ đẹp kỳ ảo của Đà Nẵng từ tầm nhìn của BOOKING X</h2>
           </div>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '50px' }}>
           <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a1a' }}>Cẩm nang du lịch</h3>
           <div style={{ width: '50px', height: '4px', background: '#0070f3', marginTop: '10px' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
           {blogs.map(blog => (
             <div key={blog.id} className="animate-up hover-premium" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <img src={blog.img} style={{ width: '100%', height: '240px', objectFit: 'cover' }} alt="Blog Da Nang" />
                <div style={{ padding: '30px' }}>
                   <p style={{ fontSize: '13px', color: '#888', fontWeight: '600', marginBottom: '15px' }}>{blog.date}</p>
                   <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', lineHeight: '1.4', marginBottom: '20px' }}>{blog.title}</h4>
                   <a href="#" style={{ color: '#0070f3', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>Đọc thêm <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i></a>
                </div>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
}
