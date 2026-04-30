export default function AboutPage() {
  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      {/* Hero Section */}
      <section style={{ height: '400px', backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-1px' }}>Về XTRAVEL</h1>
        <p style={{ fontSize: '18px', maxWidth: '700px', opacity: '0.9', lineHeight: '1.6' }}>Hành trình mang đến những trải nghiệm nghỉ dưỡng xa hoa và đẳng cấp nhất cho khách hàng trên toàn thế giới.</p>
      </section>

      {/* Story Section */}
      <section className="container" style={{ padding: '80px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '2px', display: 'block', marginBottom: '12px' }}>Câu chuyện của chúng tôi</span>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '24px', lineHeight: '1.2' }}>Hơn 10 năm kiến tạo những giá trị đích thực</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '20px', fontSize: '16px' }}>Được thành lập từ năm 2015, XTRAVEL khởi đầu là một khách sạn boutique nhỏ tại trung tâm Đà Nẵng. Với khát khao định nghĩa lại sự sang trọng, chúng tôi đã không ngừng nỗ lực để trở thành một biểu tượng của ngành dịch vụ khách sạn.</p>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '32px', fontSize: '16px' }}>Mỗi chi tiết tại XTRAVEL đều được chăm chút tỉ mỉ, từ kiến trúc hiện đại hòa quyện cùng nét văn hóa địa phương, đến đội ngũ nhân sự tận tâm, luôn sẵn lòng phục vụ vượt trên cả sự mong đợi.</p>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>50+</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Hạng phòng sang trọng</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>15k+</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Khách hàng tin tưởng</div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>4.9</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Đánh giá trung bình</div>
              </div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80" alt="About" style={{ width: '100%', borderRadius: '20px', boxShadow: 'var(--shadow-lg)' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '200px', height: '200px', backgroundColor: 'var(--secondary)', borderRadius: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', textAlign: 'center', padding: '20px', transform: 'rotate(-5deg)', zIndex: -1 }}>
               <span style={{ fontWeight: '700', fontSize: '20px' }}>Best Hotel 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ backgroundColor: '#f8fafc', padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-dark)' }}>Giá trị cốt lõi</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            <ValueCard icon="fa-heart" title="Tận tâm phục vụ" text="Chúng tôi luôn đặt sự hài lòng của khách hàng lên hàng đầu trong mọi hoạt động." />
            <ValueCard icon="fa-gem" title="Chất lượng 5 sao" text="Cam kết cung cấp dịch vụ và cơ sở vật chất đạt tiêu chuẩn quốc tế cao nhất." />
            <ValueCard icon="fa-leaf" title="Bền vững" text="Phát triển kinh doanh đi đôi với bảo vệ môi trường và đóng góp cho cộng đồng." />
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ icon, title, text }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px', fontSize: '24px' }}>
        <i className={`fas ${icon}`}></i>
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '16px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{text}</p>
    </div>
  );
}
