export default function GalleryPage() {
  const images = [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    'https://images.unsplash.com/photo-1551882547-ff43c63efe81?w=800',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
    'https://images.unsplash.com/photo-1544124499-58912cbddaad?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
  ];

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out', padding: '60px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '16px' }}>Thư viện ảnh</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Những khoảnh khắc tuyệt vời và không gian đẳng cấp tại XTRAVEL.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {images.map((img, i) => (
            <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', height: '300px', cursor: 'pointer', position: 'relative' }}>
              <img src={img} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.3s', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                 <i className="fas fa-search-plus" style={{ color: '#fff', fontSize: '32px' }}></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
