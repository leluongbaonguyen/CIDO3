export const mockRooms = Array.from({ length: 100 }, (_, i) => {
  const types = [
    { name: 'Deluxe Ocean View', price: 1800000, img: '/images/img_f32f169e45.jpeg', rating: 9.2 },
    { name: 'Executive Suite', price: 3500000, img: '/images/img_df2df8fd9f.jpeg', rating: 9.5 },
    { name: 'Penthouse Luxury', price: 12000000, img: '/images/img_88333f89e9.jpeg', rating: 9.9 },
    { name: 'Superior Garden', price: 1500000, img: '/images/img_1c41530ecd.jpeg', rating: 8.8 },
    { name: 'Family Connect', price: 4500000, img: '/images/img_696a4b85ba.jpeg', rating: 9.3 }
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
    desc: `Phòng ${type.name} tại BOOKING X Đà Nẵng mang đến không gian nghỉ dưỡng tinh tế với thiết kế hòa quyện giữa nét hiện đại và vẻ đẹp tự nhiên của thành phố biển.`
  };
});
