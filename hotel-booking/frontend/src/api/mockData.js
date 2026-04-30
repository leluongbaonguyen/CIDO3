const generateRooms = () => {
  const types = [
    { name: 'Standard', price: 500000, max: 2, img: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800' },
    { name: 'Superior', price: 850000, max: 2, img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800' },
    { name: 'Deluxe', price: 1200000, max: 3, img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800' },
    { name: 'Suite', price: 2500000, max: 4, img: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800' }
  ];
  
  const rooms = [];
  for (let i = 1; i <= 100; i++) {
    const floor = Math.ceil(i / 10);
    const roomNum = i % 10 === 0 ? floor * 100 + 10 : floor * 100 + (i % 10);
    const type = types[(i - 1) % 4];
    rooms.push({
      id: i,
      room_type_name: type.name,
      room_number: roomNum.toString(),
      floor: floor,
      base_price: type.price,
      max_occupancy: type.max,
      status: Math.random() > 0.8 ? 'OCCUPIED' : Math.random() > 0.9 ? 'MAINTENANCE' : 'AVAILABLE',
      photo_urls: JSON.stringify([type.img]),
      description: `Phòng ${type.name} hạng sang, đầy đủ tiện nghi, view đẹp thoáng mát.`,
      amenities: [
        { id: 1, name: 'Wifi miễn phí', icon: 'fa-wifi' },
        { id: 2, name: 'Điều hòa', icon: 'fa-snowflake' }
      ]
    });
  }
  return rooms;
};

const generateBookings = () => {
  const statuses = ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'];
  const roomTypes = ['Standard', 'Superior', 'Deluxe', 'Suite'];
  const bookings = [];
  
  // Tạo 3 đơn cụ thể cho tài khoản mẫu
  const sampleBookings = [
    {
      id: 999,
      booking_date: '2026-04-30T10:00:00Z',
      checkin_date: '2026-05-01',
      checkout_date: '2026-05-03',
      total_amount: 1500000,
      total_guests: 2,
      status: 'PENDING',
      customer_name: 'Khách hàng',
      customer_phone: '0987654321',
      bookingCode: 'BK999',
      room_number: '101',
      room_type_name: 'Standard'
    },
    {
      id: 998,
      booking_date: '2026-04-28T14:00:00Z',
      checkin_date: '2026-05-10',
      checkout_date: '2026-05-12',
      total_amount: 2400000,
      total_guests: 2,
      status: 'CONFIRMED',
      customer_name: 'Khách hàng',
      customer_phone: '0987654321',
      bookingCode: 'BK998',
      room_number: '305',
      room_type_name: 'Deluxe'
    }
  ];

  const customers = ['Lê Bảo Nguyên', 'Trần Huy', 'Phan Hiền', 'Hồng Cường', 'Tấn Nguyên', 'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Hoàng D', 'Võ Minh E'];
  
  for (let i = 1; i <= 98; i++) {
    const startDay = Math.floor(Math.random() * 20) + 1;
    const endDay = startDay + Math.floor(Math.random() * 4) + 1;
    bookings.push({
      id: 1000 + i,
      booking_date: `2026-04-${String(startDay).padStart(2, '0')}T10:00:00Z`,
      checkin_date: `2026-05-${String(startDay).padStart(2, '0')}`,
      checkout_date: `2026-05-${String(endDay).padStart(2, '0')}`,
      total_amount: (Math.floor(Math.random() * 5) + 5) * 200000,
      total_guests: Math.floor(Math.random() * 3) + 1,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      customer_name: customers[i % customers.length],
      customer_phone: '09' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
      bookingCode: `BK${1000 + i}`,
      room_number: (Math.floor(Math.random() * 100) + 1).toString(),
      room_type_name: roomTypes[Math.floor(Math.random() * 4)]
    });
  }
  return [...sampleBookings, ...bookings];
};

const generateCustomers = () => {
  const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Phan', 'Võ', 'Đặng', 'Bùi'];
  const lastNames = ['An', 'Bình', 'Chi', 'Dũng', 'Em', 'Giang', 'Hùng', 'Kiên', 'Linh', 'Minh'];
  const cities = ['Đà Nẵng', 'Hà Nội', 'TP. HCM', 'Cần Thơ', 'Hải Phòng', 'Huế'];
  const customers = [];
  for (let i = 1; i <= 50; i++) {
    const name = `${firstNames[i % 10]} ${lastNames[Math.floor(Math.random() * 10)]}`;
    customers.push({
      id: i,
      name: name,
      email: `user${i}@example.com`,
      phone: '09' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
      status: Math.random() > 0.1 ? 'Active' : 'Locked',
      location: cities[Math.floor(Math.random() * cities.length)],
      createdAt: `2026-0${Math.floor(Math.random() * 4) + 1}-15`
    });
  }
  const team = [
    { id: 101, name: 'Lê Lương Bảo Nguyên', email: 'nguyen@gmail.com', phone: '0901234567', status: 'Active', location: 'Đà Nẵng', createdAt: '2026-01-01' },
    { id: 102, name: 'Trần Huy', email: 'huy@gmail.com', phone: '0902345678', status: 'Active', location: 'Quảng Nam', createdAt: '2026-01-01' },
    { id: 103, name: 'Phan Thị Phước Hiền', email: 'hien@gmail.com', phone: '0903456789', status: 'Active', location: 'Huế', createdAt: '2026-01-01' },
    { id: 104, name: 'Trịnh Hồng Cường', email: 'cuong@gmail.com', phone: '0904567890', status: 'Active', location: 'Đà Nẵng', createdAt: '2026-01-01' },
    { id: 105, name: 'Trần Tấn Nguyên', email: 'tannguyen@gmail.com', phone: '0905678901', status: 'Active', location: 'Bình Định', createdAt: '2026-01-01' }
  ];
  return [...team, ...customers];
};

export const mockData = {
  rooms: generateRooms(),
  bookings: generateBookings(),
  customers: generateCustomers(),
  adminDashboard: {
    totalRevenue: 1250000000,
    totalBookings: 156,
    occupancyRate: 84,
    recentBookings: [
      { id: 1003, date: '2026-04-30', customer: 'Trần Thị B', amount: 5000000, status: 'CONFIRMED' },
      { id: 1004, date: '2026-04-30', customer: 'Lê Văn C', amount: 1200000, status: 'PENDING' }
    ]
  }
};
