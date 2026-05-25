import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BookingBar() {
  const navigate = useNavigate();
  
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const [bookingState, setBookingState] = useState({
    checkIn: formatDate(today),
    checkOut: formatDate(tomorrow),
    adults: 2,
    children: 0
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingState(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    const checkInDate = new Date(bookingState.checkIn);
    const checkOutDate = new Date(bookingState.checkOut);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (checkInDate < now) {
      setError('Ngày nhận phòng không được ở quá khứ');
      return;
    }

    if (checkOutDate <= checkInDate) {
      setError('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    const queryParams = new URLSearchParams(bookingState).toString();
    navigate(`/rooms?${queryParams}`);
  };

  return (
    <div className="booking-bar-wrapper">
      <form className="glass-effect booking-bar" onSubmit={handleSearch}>
        <div className="search-field">
          <label>NGÀY NHẬN PHÒNG</label>
          <div className="input-with-icon">
            <i className="far fa-calendar-alt"></i>
            <input 
              type="date" 
              name="checkIn"
              value={bookingState.checkIn} 
              onChange={handleChange}
              min={formatDate(today)}
            />
          </div>
        </div>

        <div className="search-field">
          <label>NGÀY TRẢ PHÒNG</label>
          <div className="input-with-icon">
            <i className="far fa-calendar-check"></i>
            <input 
              type="date" 
              name="checkOut"
              value={bookingState.checkOut} 
              onChange={handleChange}
              min={bookingState.checkIn}
            />
          </div>
        </div>

        <div className="search-field">
          <label>NGƯỜI LỚN</label>
          <div className="input-with-icon">
            <i className="far fa-user"></i>
            <input 
              type="number" 
              name="adults"
              value={bookingState.adults} 
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="search-field no-border">
          <label>TRẺ EM</label>
          <div className="input-with-icon">
            <i className="fas fa-child"></i>
            <input 
              type="number" 
              name="children"
              value={bookingState.children} 
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <button type="submit" className="btn-gold">
          TÌM PHÒNG NGAY
        </button>
      </form>
      
      {error && (
        <div className="booking-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <style>{`
        .booking-bar-wrapper {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
        }
        .booking-bar {
          display: flex;
          padding: 10px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          align-items: center;
          gap: 5px;
        }
        .search-field {
          flex: 1;
          padding: 15px 20px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          text-align: left;
        }
        .search-field.no-border {
          border-right: none;
        }
        .search-field label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          color: var(--gold);
          letter-spacing: 1.5px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .input-with-icon {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .input-with-icon i {
          color: var(--gold);
          font-size: 16px;
        }
        .input-with-icon input {
          background: transparent;
          border: none;
          color: white;
          font-weight: 700;
          font-size: 15px;
          outline: none;
          width: 100%;
        }
        .input-with-icon input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        .btn-gold {
          height: 65px;
          padding: 0 40px;
          border-radius: 15px;
          font-weight: 800;
          letter-spacing: 1px;
          white-space: nowrap;
          background: var(--gold);
          color: #fff;
          border: none;
          cursor: pointer;
          transition: 0.3s;
        }
        .btn-gold:hover {
          background: #c5a037;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .booking-error {
          position: absolute;
          bottom: -45px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(220, 53, 69, 0.9);
          color: white;
          padding: 8px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideUp 0.3s ease;
        }
        @media (max-width: 992px) {
          .booking-bar {
            flex-direction: column;
            padding: 20px;
          }
          .search-field {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .btn-gold {
            width: 100%;
            margin-top: 10px;
          }
        }
      `}</style>
    </div>
  );
}
