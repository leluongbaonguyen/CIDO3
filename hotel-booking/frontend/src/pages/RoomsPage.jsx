import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getRooms, getRoomTypes, getAmenities } from '../api/roomApi';

export default function RoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isScrollingLoading, setIsScrollingLoading] = useState(false);

  // Reset pagination when search parameters/filters change
  useEffect(() => {
    setVisibleCount(6);
    setIsScrollingLoading(false);
  }, [searchParams]);

  // Infinite Scroll / Lazy Loading scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingLoading || visibleCount >= rooms.length || loading) return;
      
      const threshold = 150; // Trigger when 150px from bottom
      const totalHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.innerHeight + window.scrollY;
      
      if (totalHeight - scrollPosition < threshold) {
        setIsScrollingLoading(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + 6);
          setIsScrollingLoading(false);
        }, 800); // 800ms elegant shimmer transition
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrollingLoading, visibleCount, rooms.length, loading]);


  // Extract filters from URL
  const selectedTypes = searchParams.get('roomTypeIds')?.split(',').filter(Boolean) || [];
  const selectedAmenities = searchParams.get('amenityIds')?.split(',').filter(Boolean) || [];

  const rawCheckIn = searchParams.get('checkIn');
  const rawCheckOut = searchParams.get('checkOut');
  const checkIn = rawCheckIn === 'null' ? null : rawCheckIn;
  const checkOut = rawCheckOut === 'null' ? null : rawCheckOut;
  const adults = searchParams.get('adults') || 2;
  const children = searchParams.get('children') || 0;
  const roomsCount = searchParams.get('rooms') || 1;

  useEffect(() => {
    const init = async () => {
      try {
        const [typesData, amenitiesData] = await Promise.all([
          getRoomTypes(),
          getAmenities()
        ]);
        setRoomTypes(typesData);
        setAmenities(amenitiesData);
      } catch (err) {
        console.error('Failed to load filters:', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const params = Object.fromEntries([...searchParams]);
        const data = await getRooms(params);
        setRooms(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [searchParams]);

  const handleFilterToggle = (id, type) => {
    const current = type === 'roomType' ? [...selectedTypes] : [...selectedAmenities];
    const index = current.indexOf(id.toString());
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id.toString());
    }

    const newParams = new URLSearchParams(searchParams);
    const paramKey = type === 'roomType' ? 'roomTypeIds' : 'amenityIds';
    
    if (current.length > 0) {
      newParams.set(paramKey, current.join(','));
    } else {
      newParams.delete(paramKey);
    }
    
    setSearchParams(newParams);
  };

  const getDisplayImage = (photoUrls) => {
    if (!photoUrls || photoUrls === 'null' || photoUrls === 'undefined') return '/images/rooms/std-1.jpg';
    try {
      // Xử lý nếu là JSON string
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
      // Fallback cho chuỗi phân cách dấu phẩy hoặc chuỗi đơn
      if (typeof photoUrls === 'string') {
        return photoUrls.split(',')[0].replace(/[\[\]"]/g, '').trim() || '/images/rooms/std-1.jpg';
      }
      return '/images/rooms/std-1.jpg';
    }
  };


  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '60px 0' }}>
      <div className="container">
        
        {/* TOP SUMMARY */}
        <div style={{ background: 'var(--black)', padding: '30px 45px', borderRadius: '32px', color: '#fff', marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(196, 166, 97, 0.3)', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }}>
           <div>
              <span style={{ color: 'var(--gold)', fontWeight: '800', letterSpacing: '3px', fontSize: '11px', textTransform: 'uppercase' }}>Available Sanctuaries</span>
              <h3 className="serif" style={{ fontSize: '28px', fontWeight: '900', color: '#fff', marginTop: '5px' }}>
                {rooms.length > 0 ? `We found ${rooms.length} rooms for you` : 'No rooms available for these filters'}
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.6, marginTop: '10px' }}>
                <i className="far fa-calendar-alt" style={{ color: 'var(--gold)', marginRight: '8px' }}></i> {checkIn} to {checkOut} | 
                <i className="far fa-user" style={{ color: 'var(--gold)', marginLeft: '15px', marginRight: '8px' }}></i> {adults} Adults, {children} Children | 
                <i className="fas fa-bed" style={{ color: 'var(--gold)', marginLeft: '15px', marginRight: '8px' }}></i> {roomsCount} Rooms
              </p>
           </div>
           <div>
              <Link to="/" className="btn-gold" style={{ padding: '12px 30px', fontSize: '11px', borderRadius: '12px' }}>MODIFY SEARCH</Link>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '60px' }}>
          
          {/* LEFT: FILTERS */}
          <div className="animate-fade-up">
            <div style={{ background: 'var(--gray-light)', borderRadius: '32px', padding: '40px', position: 'sticky', top: '120px' }}>
               <h4 className="serif" style={{ fontSize: '22px', fontWeight: '800', marginBottom: '30px' }}>Refine By</h4>
               
               <FilterGroup 
                 title="HẠNG PHÒNG" 
                 options={roomTypes} 
                 selected={selectedTypes} 
                 onToggle={(id) => handleFilterToggle(id, 'roomType')} 
               />

               <FilterGroup 
                 title="TIỆN NGHI" 
                 options={amenities} 
                 selected={selectedAmenities} 
                 onToggle={(id) => handleFilterToggle(id, 'amenity')} 
               />

               <button 
                onClick={() => {
                  const defaultParams = { adults, children, rooms: roomsCount };
                  if (checkIn && checkIn !== 'null') defaultParams.checkIn = checkIn;
                  if (checkOut && checkOut !== 'null') defaultParams.checkOut = checkOut;
                  setSearchParams(defaultParams);
                }}
                style={{ width: '100%', background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginTop: '20px' }}>
                 RESET FILTERS
               </button>
            </div>
          </div>

          {/* RIGHT: LIST */}
          <div className="animate-fade-up">
             {error ? (
               <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>{error}</div>
             ) : loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="card-luxury" style={{ display: 'grid', gridTemplateColumns: '380px 1fr 260px', overflow: 'hidden' }}>
                      <div className="skeleton-pulse" style={{ height: '320px', width: '380px', borderRadius: '0' }}></div>
                      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                         <div className="skeleton-pulse" style={{ width: '80px', height: '14px' }}></div>
                         <div className="skeleton-pulse" style={{ width: '220px', height: '30px' }}></div>
                         <div className="skeleton-pulse" style={{ width: '150px', height: '18px' }}></div>
                         <div className="skeleton-pulse" style={{ width: '100%', height: '60px' }}></div>
                         <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                            <div className="skeleton-pulse" style={{ width: '80px', height: '24px', borderRadius: '6px' }}></div>
                            <div className="skeleton-pulse" style={{ width: '100px', height: '24px', borderRadius: '6px' }}></div>
                         </div>
                      </div>
                      <div style={{ padding: '40px', borderLeft: '1px solid rgba(0,0,0,0.05)', background: '#fafbfc', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                         <div className="skeleton-pulse" style={{ width: '100px', height: '14px' }}></div>
                         <div className="skeleton-pulse" style={{ width: '140px', height: '28px' }}></div>
                         <div className="skeleton-pulse" style={{ width: '100%', height: '45px', borderRadius: '50px', marginTop: '15px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
             ) : rooms.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '100px', background: '#f8fafc', borderRadius: '32px' }}>
                  <i className="fas fa-search" style={{ fontSize: '50px', color: 'var(--gold)', marginBottom: '20px', opacity: 0.3 }}></i>
                  <h3 className="serif" style={{ fontSize: '24px' }}>No Rooms Available</h3>
                  <p style={{ color: 'var(--gray)', marginTop: '10px' }}>Hãy thử thay đổi tiêu chí lọc hoặc ngày đặt phòng.</p>
                  <Link to="/" className="btn-gold" style={{ marginTop: '30px', display: 'inline-block' }}>Quay lại trang chủ</Link>
               </div>
             ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  {rooms.slice(0, visibleCount).map(room => (
                    <div key={room.id} className={`card-luxury ${!room.isAvailable ? 'booked' : ''}`} style={{ display: 'grid', gridTemplateColumns: '380px 1fr 260px' }}>
                      
                      <div className="img-zoom-container" style={{ height: '320px', borderRadius: '0' }}>
                         <img src={getDisplayImage(room.photo_urls)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={room.room_type_name} />
                         <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'var(--gold)', color: '#fff', padding: '8px 15px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>{room.room_number}</div>
                      </div>

                      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>FLOOR {room.floor}</span>
                         <h3 className="serif" style={{ fontSize: '28px', fontWeight: '900', color: 'var(--black)', marginBottom: '15px' }}>{room.room_type_name}</h3>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--gray)', fontWeight: '600' }}><i className="fas fa-users" style={{ color: 'var(--gold)' }}></i> Max {room.max_occupancy} Guests</span>
                         </div>
                         <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>{room.description?.substring(0, 100)}...</p>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: 'auto', alignItems: 'center' }}>
                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: '700' }}>{room.status}</span>
                            <span className={room.isAvailable ? 'status-available' : 'status-booked'} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                               <i className={`fas ${room.isAvailable ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                               {room.isAvailable ? 'SẴN SÀNG' : 'ĐÃ ĐƯỢC ĐẶT'}
                            </span>
                         </div>
                      </div>

                      <div style={{ padding: '40px', borderLeft: '1px solid rgba(0,0,0,0.05)', background: '#fafbfc', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                         <p style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: '800', marginBottom: '5px', textTransform: 'uppercase' }}>Price per Night</p>
                         <p className="serif" style={{ fontSize: '24px', fontWeight: '900', color: 'var(--gold)', marginBottom: '10px' }}>{Number(room.base_price).toLocaleString()} <span style={{ fontSize: '12px' }}>VND</span></p>
                         
                         {room.totalPrice > 0 && (
                           <div style={{ margin: '15px 0', padding: '10px', background: '#fff', borderRadius: '12px', border: '1px dashed var(--gold)' }}>
                             <p style={{ fontSize: '11px', fontWeight: '700' }}>TOTAL ({room.nights} nights)</p>
                             <p style={{ fontSize: '18px', fontWeight: '900', color: 'var(--black)' }}>{room.totalPrice.toLocaleString()} VND</p>
                           </div>
                         )}

                         {room.isAvailable ? (
                           <Link to={`/rooms/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`} className="btn-gold" style={{ fontSize: '12px', width: '100%' }}>BOOK NOW</Link>
                         ) : (
                           <button disabled className="btn-gold btn-disabled" style={{ fontSize: '12px', width: '100%' }}>FULLY BOOKED</button>
                         )}
                      </div>

                    </div>
                  ))}
                  
                  {isScrollingLoading && (
                    <div className="card-luxury" style={{ display: 'grid', gridTemplateColumns: '380px 1fr 260px', overflow: 'hidden' }}>
                      <div className="skeleton-pulse" style={{ height: '320px', width: '380px', borderRadius: '0' }}></div>
                      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                         <div className="skeleton-pulse" style={{ width: '80px', height: '14px' }}></div>
                         <div className="skeleton-pulse" style={{ width: '220px', height: '30px' }}></div>
                         <div className="skeleton-pulse" style={{ width: '150px', height: '18px' }}></div>
                         <div className="skeleton-pulse" style={{ width: '100%', height: '60px' }}></div>
                         <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                            <div className="skeleton-pulse" style={{ width: '80px', height: '24px', borderRadius: '6px' }}></div>
                            <div className="skeleton-pulse" style={{ width: '100px', height: '24px', borderRadius: '6px' }}></div>
                         </div>
                      </div>
                      <div style={{ padding: '40px', borderLeft: '1px solid rgba(0,0,0,0.05)', background: '#fafbfc', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                         <div className="skeleton-pulse" style={{ width: '100px', height: '14px' }}></div>
                         <div className="skeleton-pulse" style={{ width: '140px', height: '28px' }}></div>
                         <div className="skeleton-pulse" style={{ width: '100%', height: '45px', borderRadius: '50px', marginTop: '15px' }}></div>
                      </div>
                    </div>
                  )}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, options, selected, onToggle, maxHeight = '160px' }) {
  return (
    <div style={{ marginBottom: '40px' }}>
       <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--gold)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
       <div style={{ maxHeight: maxHeight, overflowY: 'auto', paddingRight: '8px' }} className="custom-luxury-scrollbar">
         {options.length === 0 ? (
           Array.from({ length: 3 }).map((_, idx) => (
             <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
               <div className="skeleton-pulse" style={{ width: '20px', height: '20px', borderRadius: '4px' }}></div>
               <div className="skeleton-pulse" style={{ width: '120px', height: '16px' }}></div>
             </div>
           ))
         ) : (
           options.map(opt => (
             <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <input 
                  type="checkbox" 
                  checked={selected.includes(opt.id.toString())}
                  onChange={() => onToggle(opt.id)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--gold)', cursor: 'pointer' }} 
                />
                <span style={{ fontSize: '15px', color: 'var(--black)', fontWeight: '600' }}>{opt.name}</span>
             </div>
           ))
         )}
       </div>
    </div>
  );
}
