export const mockRooms = Array.from({ length: 100 }, (_, i) => {
  const types = [
    { name: 'Deluxe Ocean View', price: 1800000, img: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800', rating: 9.2 },
    { name: 'Executive Suite', price: 3500000, img: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800', rating: 9.5 },
    { name: 'Penthouse Luxury', price: 12000000, img: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800', rating: 9.9 },
    { name: 'Superior Garden', price: 1500000, img: 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?auto=compress&cs=tinysrgb&w=800', rating: 8.8 },
    { name: 'Family Connect', price: 4500000, img: 'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=800', rating: 9.3 }
  ];

  const type = types[i % types.length];
  const roomNumber = 100 + i + 1;
  const floor = Math.floor(i / 10) + 1;

  return {
    id: i + 1,
    roomNumber: `P.${roomNumber}`,
    floor: `Tầng ${floor}`,
    title: `${type.name} #${roomNumber}`,
    baseName: type.name,
    price: (type.price + (Math.floor(Math.random() * 5) * 50000)).toLocaleString(),
    stars: 5,
    rating: type.rating,
    reviews: Math.floor(Math.random() * 200 + 50),
    amenities: ['Wifi', 'Bể bơi', 'Ăn sáng', 'Ban công', 'Minibar'],
    img: type.img,
    desc: `Phòng ${type.name} tại XTRAVEL Đà Nẵng mang đến không gian nghỉ dưỡng tinh tế với thiết kế hòa quyện giữa nét hiện đại và vẻ đẹp tự nhiên của thành phố biển.`
  };
});
