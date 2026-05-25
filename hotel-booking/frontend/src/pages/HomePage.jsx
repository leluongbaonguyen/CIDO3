import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BookingBar from '../components/BookingBar';
import { getRoomTypes } from '../api/roomApi';

export default function HomePage() {
  const navigate = useNavigate();
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRoomTypes();
        setRoomTypes(data.slice(0, 3)); // Display top 3 signature room types
      } catch (err) {
        console.error('Failed to fetch signature room types:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const getDisplayImage = (photoUrls) => {
    if (!photoUrls || photoUrls === 'null' || photoUrls === 'undefined') return '/images/rooms/std-1.jpg';
    try {
      const urls = typeof photoUrls === 'string' && (photoUrls.startsWith('[') || photoUrls.startsWith('{')) 
        ? JSON.parse(photoUrls) 
        : photoUrls;
        
      if (Array.isArray(urls) && urls.length > 0) return urls[0];
      if (typeof urls === 'string') {
        const cleaned = urls.replace(/[\[\]"]/g, '').split(',')[0].trim();
        return cleaned || '/images/rooms/std-1.jpg';
      }
      return '/images/rooms/std-1.jpg';
    } catch (e) {
      if (typeof photoUrls === 'string') {
        return photoUrls.split(',')[0].replace(/[\[\]"]/g, '').trim() || '/images/rooms/std-1.jpg';
      }
      return '/images/rooms/std-1.jpg';
    }
  };

  return (
    <div style={{ backgroundColor: '#fff' }}>
      
      {/* 1. HERO SECTION - IMMERSIVE LUXURY */}
      <section style={{ 
        height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--black)', overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: 'url("/images/rooms/ocean-view.jpg")',
          backgroundSize: 'cover', backgroundPosition: 'center',
          animation: 'zoomIn 20s infinite alternate linear'
        }}>
           <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,15,29,0.3) 0%, rgba(10,15,29,0.9) 100%)' }}></div>
        </div>

        <div className="animate-fade-in" style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: '#fff', maxWidth: '1100px', padding: '0 25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
             <div style={{ width: '50px', height: '1.5px', background: 'var(--gold)' }}></div>
             <span style={{ color: 'var(--gold)', letterSpacing: '8px', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}>Royal Heritage • Da Nang</span>
             <div style={{ width: '50px', height: '1.5px', background: 'var(--gold)' }}></div>
          </div>
          <h1 className="serif" style={{ fontSize: '110px', fontWeight: '900', marginBottom: '30px', lineHeight: '0.9', letterSpacing: '-4px' }}>
            Elevate Your<br />
            <span className="text-gold" style={{ fontStyle: 'italic', fontWeight: '400' }}>Existence</span>
          </h1>
          <p style={{ fontSize: '22px', color: 'rgba(255,255,255,0.7)', marginBottom: '70px', maxWidth: '700px', margin: '0 auto 70px', lineHeight: '1.6', fontWeight: '500' }}>
            Khám phá tinh hoa nghỉ dưỡng tại thiên đường ven biển Đà Nẵng, nơi mỗi khoảnh khắc đều trở thành kiệt tác nghệ thuật.
          </p>
          
          <BookingBar />
        </div>

        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', color: '#fff' }}>
            <p style={{ fontSize: '12px', letterSpacing: '4px', opacity: 0.5, marginBottom: '10px', textTransform: 'uppercase' }}>Scroll to Explore</p>
            <div style={{ width: '1px', height: '60px', background: 'var(--gold)', margin: '0 auto' }}></div>
        </div>
      </section>

      {/* 2. ABOUT / DISCOVER SECTION */}
      <section style={{ padding: '160px 0', background: '#fff' }}>
         <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
               <div className="animate-fade-in">
                  <h3 style={{ color: 'var(--gold)', letterSpacing: '4px', fontSize: '14px', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase' }}>The Art of Living</h3>
                  <h2 className="serif" style={{ fontSize: '56px', fontWeight: '900', color: 'var(--primary)', marginBottom: '30px', lineHeight: '1.1' }}>
                    Nơi di sản gặp gỡ<br />tương lai.
                  </h2>
                  <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px', lineHeight: '1.8' }}>
                    Với hơn 30 năm kinh nghiệm trong ngành khách sạn cao cấp, BOOKING X không chỉ mang đến một nơi nghỉ ngơi, mà là một biểu tượng của sự sang trọng và lòng hiếu khách chân thành.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '50px' }}>
                     <div>
                        <h4 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--gold)' }}>150+</h4>
                        <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '700' }}>Phòng nghỉ cao cấp</p>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--gold)' }}>5 ★</h4>
                        <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '700' }}>Dịch vụ tiêu chuẩn</p>
                      </div>
                  </div>
                  <Link to="/about" className="btn-gold">Xem thêm về chúng tôi</Link>
               </div>
               <div style={{ position: 'relative' }}>
                  <img src="/images/rooms/pool-view.jpg" style={{ width: '100%', borderRadius: '40px', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }} alt="Hotel" />
                  <div style={{ 
                    position: 'absolute', bottom: '-40px', left: '-40px', padding: '40px', background: 'var(--gold)', color: '#fff', 
                    borderRadius: '30px', width: '280px', boxShadow: '0 20px 40px rgba(212,175,55,0.3)' 
                  }}>
                     <p style={{ fontSize: '40px', fontWeight: '900', lineHeight: '1' }}>30Y</p>
                     <p style={{ fontSize: '14px', fontWeight: '700', marginTop: '10px' }}>Experience in Hospitality</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 3. SIGNATURE ROOMS */}
      <section style={{ padding: '120px 0', background: '#f8fafc' }}>
         <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px' }}>
               <div>
                  <h2 className="serif" style={{ fontSize: '56px', fontWeight: '900', color: 'var(--primary)' }}>Signature Suites</h2>
                  <p style={{ color: '#64748b', marginTop: '15px', fontSize: '18px' }}>Trải nghiệm sự khác biệt trong từng chi tiết thiết kế.</p>
               </div>
               <Link to="/rooms" style={{ color: 'var(--gold)', fontWeight: '800', fontSize: '16px', textDecoration: 'none' }}>XEM TẤT CẢ PHÒNG <i className="fas fa-arrow-right"></i></Link>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
               {loading ? (
                 Array.from({ length: 3 }).map((_, idx) => (
                   <div key={idx} className="card-luxury" style={{ overflow: 'hidden' }}>
                      <div className="skeleton-pulse" style={{ height: '400px', width: '100%' }}></div>
                      <div style={{ padding: '35px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                         <div className="skeleton-pulse" style={{ width: '220px', height: '26px' }}></div>
                         <div style={{ display: 'flex', gap: '15px', margin: '15px 0' }}>
                            <div className="skeleton-pulse" style={{ width: '60px', height: '14px' }}></div>
                            <div className="skeleton-pulse" style={{ width: '85px', height: '14px' }}></div>
                            <div className="skeleton-pulse" style={{ width: '70px', height: '14px' }}></div>
                         </div>
                         <div className="skeleton-pulse" style={{ width: '100%', height: '45px', borderRadius: '50px' }}></div>
                      </div>
                   </div>
                 ))
               ) : roomTypes.length > 0 ? (
                 roomTypes.map((type) => (
                   <RoomCard 
                     key={type.id}
                     title={type.name} 
                     price={Number(type.base_price).toLocaleString()} 
                     img={getDisplayImage(type.photo_urls)} 
                     tag={type.max_occupancy ? `Max ${type.max_occupancy} Khách` : "Luxury"} 
                   />
                 ))
               ) : (
                 <div style={{ gridColumn: 'span 3', textAlign: 'center', color: 'var(--gray)' }}>
                   Không tìm thấy hạng phòng nào trong cơ sở dữ liệu.
                 </div>
               )}
            </div>
         </div>
      </section>

      {/* 4. SERVICES GRID */}
      <section style={{ padding: '160px 0', background: 'var(--primary)', color: '#fff' }}>
         <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '100px' }}>
               <h2 className="serif" style={{ fontSize: '56px', fontWeight: '900', color: 'var(--gold)' }}>Immersive Experiences</h2>
               <p style={{ opacity: 0.6, marginTop: '20px', fontSize: '18px' }}>Chúng tôi chăm sóc mọi nhu cầu của bạn với sự tỉ mỉ tuyệt đối.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
               <ServiceItem icon="fa-spa" title="Sense Spa" desc="Tái tạo năng lượng với các liệu pháp thiên nhiên." />
               <ServiceItem icon="fa-utensils" title="Michelin Dining" desc="Hành trình ẩm thực xuyên lục địa." />
               <ServiceItem icon="fa-water" title="Private Beach" desc="Bãi biển riêng tư tuyệt đẹp tại Đà Nẵng." />
               <ServiceItem icon="fa-concierge-bell" title="24/7 Butler" desc="Dịch vụ quản gia riêng biệt cho từng phòng." />
            </div>
         </div>
      </section>

      <style>{`
        @keyframes zoomIn {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

function RoomCard({ title, price, img, tag }) {
  return (
    <div className="card-luxury animate-fade-in" style={{ cursor: 'pointer' }}>
       <div style={{ height: '400px', overflow: 'hidden', position: 'relative' }}>
          <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '1s' }} className="zoom-hover" alt={title} />
          <div style={{ position: 'absolute', top: '25px', left: '25px', padding: '8px 20px', background: 'var(--gold)', color: '#fff', borderRadius: '50px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>{tag.toUpperCase()}</div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%)' }}></div>
          <div style={{ position: 'absolute', bottom: '30px', left: '30px', color: '#fff' }}>
             <p style={{ fontSize: '13px', fontWeight: '700', opacity: 0.8, marginBottom: '5px' }}>Bắt đầu từ</p>
             <p style={{ fontSize: '24px', fontWeight: '900' }}>{price}đ <span style={{ fontSize: '14px', fontWeight: '400' }}>/ đêm</span></p>
          </div>
       </div>
       <div style={{ padding: '35px' }}>
          <h3 className="serif" style={{ fontSize: '26px', fontWeight: '900', marginBottom: '25px', color: 'var(--primary)' }}>{title}</h3>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '35px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}><i className="fas fa-expand"></i> 45m²</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}><i className="fas fa-bed"></i> King Bed</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}><i className="fas fa-wifi"></i> Free Wifi</div>
          </div>
          <Link to="/rooms" className="btn-gold shine-effect" style={{ width: '100%', justifyContent: 'center' }}>ĐẶT PHÒNG NGAY</Link>
       </div>
       <style>{`
          .zoom-hover:hover { transform: scale(1.1); }
       `}</style>
    </div>
  );
}

function ServiceItem({ icon, title, desc }) {
  return (
    <div style={{ padding: '50px 30px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '30px', textAlign: 'center', transition: '0.4s' }} className="service-card">
       <div style={{ 
            width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(212,175,55,0.1)', 
            color: 'var(--gold)', display: 'flex', justifyContent: 'center', alignItems: 'center', 
            fontSize: '32px', margin: '0 auto 30px', transition: '0.4s' 
        }} className="icon-box">
            <i className={`fas ${icon}`}></i>
       </div>
       <h4 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '15px' }}>{title}</h4>
       <p style={{ fontSize: '14px', opacity: 0.6, lineHeight: '1.6' }}>{desc}</p>
       <style>{`
          .service-card:hover { background: rgba(255,255,255,0.08); transform: translateY(-10px); border-color: var(--gold); }
          .service-card:hover .icon-box { background: var(--gold); color: #fff; transform: rotate(10deg); }
       `}</style>
    </div>
  );
}
