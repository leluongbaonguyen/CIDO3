import React, { useState } from 'react';

export default function GalleryPage() {
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Phòng nghỉ', 'Tiện ích', 'Ẩm thực'];
  
  const images = [
    { id: 1, cat: 'Phòng nghỉ', url: '/images/gallery/room1.png' },
    { id: 2, cat: 'Tiện ích', url: '/images/gallery/pool1.png' },
    { id: 3, cat: 'Ẩm thực', url: '/images/gallery/dining1.png' },
    { id: 4, cat: 'Phòng nghỉ', url: '/images/rooms/suite-1.jpg' },
    { id: 5, cat: 'Tiện ích', url: '/images/rooms/ocean-view.jpg' },
    { id: 6, cat: 'Phòng nghỉ', url: '/images/rooms/penthouse-1.jpg' }
  ];

  const filteredImages = filter === 'All' ? images : images.filter(img => img.cat === filter);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '100px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }} className="animate-up">
           <h2 style={{ fontSize: '42px', fontWeight: '800', color: '#0a0f1d', fontFamily: '"Playfair Display", serif', marginBottom: '20px' }}>Thư Viện BOOKING X</h2>
           <p style={{ color: '#666', maxWidth: '700px', margin: '0 auto 40px' }}>Khám phá không gian nghỉ dưỡng sang trọng và đẳng cấp qua những thước hình chân thực nhất.</p>
           
           <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              {categories.map(c => (
                <button 
                  key={c}
                  onClick={() => setFilter(c)}
                  style={{ 
                    padding: '10px 25px', borderRadius: '50px', border: filter === c ? 'none' : '1px solid #ddd',
                    background: filter === c ? 'var(--gold)' : 'transparent',
                    color: filter === c ? '#fff' : '#666',
                    fontWeight: '700', cursor: 'pointer', transition: '0.3s'
                  }}
                >{c}</button>
              ))}
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
           {filteredImages.map(img => (
             <div key={img.id} className="animate-zoom hover-premium" style={{ borderRadius: '15px', overflow: 'hidden', height: '300px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Gallery" />
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
