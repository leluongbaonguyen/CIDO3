async function run() {
  try {
    const url = 'http://localhost:5000/api/rooms?roomTypeIds=6,7,8';
    console.log(`📡 Fetching from: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`HTTP Error: ${res.status}`);
      return;
    }
    const data = await res.json();
    console.log(`✅ Success! Received ${data.length} rooms.`);
    if (data.length > 0) {
      console.log('Mẫu 5 phòng trả về từ API:');
      console.log(data.slice(0, 5).map(r => ({ id: r.id, number: r.room_number, type_id: r.room_type_id, type_name: r.room_type_name })));
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối API:', error);
  } finally {
    process.exit();
  }
}
run();
