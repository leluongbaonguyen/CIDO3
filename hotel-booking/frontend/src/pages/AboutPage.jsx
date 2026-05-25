import React from 'react';

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '100px 0' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '80px' }} className="animate-up">
           <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0a0f1d', fontFamily: '"Playfair Display", serif', marginBottom: '20px' }}>Về BOOKING X Đà Nẵng</h1>
           <div style={{ width: '60px', height: '4px', background: '#0070f3', margin: '0 auto' }}></div>
        </div>

        <div className="animate-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '100px' }}>
           <div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '25px', color: '#1a1a1a' }}>Sứ Mệnh Của Chúng Tôi</h2>
              <p style={{ color: '#666', lineHeight: '2', fontSize: '17px', marginBottom: '20px' }}>
                BOOKING X không chỉ là một resort, đó là nơi những giấc mơ nghỉ dưỡng trở thành hiện thực. Tọa lạc tại bãi biển Mỹ Khê quyến rũ nhất hành tinh, chúng tôi cam kết mang đến trải nghiệm lưu trú tinh tế nhất.
              </p>
              <p style={{ color: '#666', lineHeight: '2', fontSize: '17px' }}>
                Với 100 phòng nghỉ được thiết kế tỉ mỉ và đội ngũ nhân viên tận tâm, BOOKING X tự hào là điểm dừng chân lý tưởng cho mọi hành trình tại Đà Nẵng.
              </p>
           </div>
           <div style={{ borderRadius: '30px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <img src="/images/img_d31fdb5400.jpeg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="About BOOKING X" />
           </div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '40px', padding: '80px 40px', textAlign: 'center' }} className="animate-up">
           <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '50px' }}>Giá Trị Cốt Lõi</h2>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
              <ValueItem icon="fa-gem" title="Sang Trọng" desc="Mọi chi tiết đều được chăm chút để đạt tới sự hoàn hảo." />
              <hr style={{ display: 'none' }} />
              <ValueItem icon="fa-heart" title="Tận Tâm" desc="Khách hàng luôn là trọng tâm trong mọi dịch vụ của chúng tôi." />
              <hr style={{ display: 'none' }} />
              <ValueItem icon="fa-leaf" title="Bền Vững" desc="Phát triển gắn liền với việc bảo vệ vẻ đẹp tự nhiên của Đà Nẵng." />
           </div>
        </div>

      </div>
    </div>
  );
}

function ValueItem({ icon, title, desc }) {
  return (
    <div>
       <div style={{ fontSize: '40px', color: '#0070f3', marginBottom: '25px' }}><i className={`fas ${icon}`}></i></div>
       <h4 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '15px' }}>{title}</h4>
       <p style={{ color: '#666', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );
}
