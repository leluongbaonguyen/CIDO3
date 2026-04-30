import { mockData } from './mockData';

export const api = async (path, options = {}) => {
  console.log(`[MOCK API] ${options.method || 'GET'} ${path}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // --- AUTH ---
  if (path.startsWith('/auth/login')) {
    const body = JSON.parse(options.body);
    let role = 'CUSTOMER';
    let id = 3;
    let name = 'Khách hàng';
    if (body.email === 'admin@xtravel.com') { role = 'ADMIN'; id = 1; name = 'Admin'; }
    if (body.email === 'staff@xtravel.com') { role = 'STAFF'; id = 2; name = 'Nhân viên'; }
    
    return {
      message: 'Login success',
      token: 'mock-jwt-token-12345',
      user: { id, email: body.email, firstName: name, lastName: '', role }
    };
  }

  // --- ROOMS ---
  if (path.startsWith('/rooms')) {
    if (path === '/rooms' || path.startsWith('/rooms?')) {
      return mockData.rooms;
    }
    // Match /rooms/:id
    const idMatch = path.match(/\/rooms\/(\d+)/);
    if (idMatch) {
      const room = mockData.rooms.find(r => r.id === Number(idMatch[1]));
      if (room) return room;
      throw new Error('Room not found');
    }
  }

  // --- BOOKINGS ---
  if (path.startsWith('/bookings')) {
    if (path.includes('/mine')) {
      return mockData.bookings.filter(b => b.customer_name === 'Khách hàng'); 
    }
    if (options.method === 'POST') {
      return { bookingId: Math.floor(Math.random() * 10000) };
    }
    // GET bookings
    return mockData.bookings;
  }

  // --- PROFILE ---
  if (path.startsWith('/auth/profile')) {
    return {
      id: 3,
      email: 'customer@gmail.com',
      firstName: 'Khách',
      lastName: 'Hàng',
      phone: '0123456789',
      customerDetails: {
        address: '123 Đường ABC',
        city: 'TP Hồ Chí Minh',
        country: 'Việt Nam'
      }
    };
  }

  // --- ADMIN ---
  if (path.startsWith('/admin/dashboard')) {
    return mockData.adminDashboard;
  }
  if (path.startsWith('/admin/bookings')) {
    return mockData.bookings;
  }
  if (path.startsWith('/admin/rooms')) {
    return mockData.rooms;
  }

  // Default fallback for anything else
  console.warn(`[MOCK API] No mock defined for ${path}, returning empty array`);
  return [];
};

