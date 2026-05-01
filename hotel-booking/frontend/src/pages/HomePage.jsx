import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BookingBar from '../components/BookingBar';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#fff' }}>
      
      {/* 1. HERO SECTION - IMMERSIVE LUXURY */}
      <section style={{ 
        height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--black)', overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80")',
          backgroundSize: 'cover', backgroundPosition: 'center',
          transform: 'scale(1.1)',
          animation: 'fadeInScale 3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
        }}>
           <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,15,29,0.3) 0%, rgba(10,15,29,0.8) 100%)' }}></div>
        </div>

        <div className="animate-fade-up" style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: '#fff', maxWidth: '1000px', padding: '0 25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '24px' }}>
             <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }}></div>
             <span style={{ color: 'var(--gold)', letterSpacing: '6px', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase' }}>Established 1994 • Da Nang</span>
             <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }}></div>
          </div>
          <h1 className="serif" style={{ fontSize: '90px', fontWeight: '900', marginBottom: '24px', lineHeight: '1', letterSpacing: '-2px' }}>Define Your<br /><i className="text-gold-gradient" style={{ fontWeight: '400' }}>Luxury</i> Legacy</h1>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', marginBottom: '60px', maxWidth: '650px', margin: '0 auto 60px', lineHeight: '1.6', fontWeight: '500' }}>
            Nơi tinh hoa kiến trúc hội tụ cùng dịch vụ đẳng cấp 5 sao quốc tế, mang đến hành trình nghỉ dưỡng mang đậm dấu ấn cá nhân.
          </p>
          
          <BookingBar />
        </div>
      </section>

      {/* ... (Các section khác giữ nguyên) ... */}
      <section style={{ padding: '120px 0', background: '#fcfcfc' }}>
         <div className="container">
            <div className="section-title">
               <h2 className="serif">Signature Accommodations</h2>
               <div className="divider"></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
               <RoomCard title="Deluxe Ocean View" price="1,800,000" img="https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800" />
               <RoomCard title="Executive River Suite" price="3,500,000" img="https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800" />
               <RoomCard title="Presidential Penthouse" price="12,000,000" img="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800" />
            </div>
         </div>
      </section>

      <section style={{ padding: '120px 0', background: '#0a0f1d', color: '#fff' }}>
         <div className="container">
            <div className="section-title">
               <h2 className="serif" style={{ color: 'var(--gold)' }}>World-Class Services</h2>
               <p style={{ opacity: 0.6, marginTop: '10px' }}>Dịch vụ hoàn hảo cho mọi khoảnh khắc lưu trú.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px' }}>
               <ServiceItem icon="fa-spa" title="Luxury Spa" desc="Liệu pháp thư giãn đỉnh cao." />
               <ServiceItem icon="fa-utensils" title="Fine Dining" desc="Ẩm thực chuẩn Michelin." />
               <ServiceItem icon="fa-swimming-pool" title="Infinity Pool" desc="Tầm nhìn vô cực ra biển." />
               <ServiceItem icon="fa-dumbbell" title="Pro Fitness" desc="Thiết bị hiện đại 24/7." />
            </div>
         </div>
      </section>
    </div>
  );
}

function RoomCard({ title, price, img }) {
  return (
    <div className="card-luxury">
       <div className="img-zoom-container" style={{ height: '350px' }}>
          <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={title} />
          <div className="img-overlay"></div>
          <div style={{ position: 'absolute', top: '20px', right: '20px', padding: '8px 15px', background: 'var(--gold)', color: '#fff', borderRadius: '50px', fontSize: '11px', fontWeight: '800' }}>BEST SELLER</div>
       </div>
       <div style={{ padding: '35px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.5px' }} className="serif">{title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '25px' }}>
             <div style={{ height: '1px', flex: 1, background: '#eee' }}></div>
             <p style={{ color: 'var(--gold)', fontWeight: '800', fontSize: '20px' }}>{price} <span style={{ fontSize: '12px', opacity: 0.6 }}>VNĐ / ĐÊM</span></p>
             <div style={{ height: '1px', flex: 1, background: '#eee' }}></div>
          </div>
          <Link to="/rooms" className="btn-gold" style={{ width: '100%', fontSize: '12px' }}>CHI TIẾT PHÒNG</Link>
       </div>
    </div>
  );
}

function ServiceItem({ icon, title, desc }) {
  return (
    <div className="glow-hover" style={{ padding: '40px', background: '#161c2d', borderRadius: '20px', textAlign: 'center', transition: '0.4s' }}>
       <i className={`fas ${icon}`} style={{ fontSize: '36px', color: 'var(--gold)', marginBottom: '20px' }}></i>
       <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>{title}</h4>
       <p style={{ fontSize: '13px', opacity: 0.6 }}>{desc}</p>
    </div>
  );
}

// ... (Các section khác giữ nguyên) ...
