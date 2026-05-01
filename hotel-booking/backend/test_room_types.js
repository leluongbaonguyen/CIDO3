const test = async () => {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@xtravel.com', password: 'password123' })
        });
        const { token } = await loginRes.json();
        
        const res = await fetch('http://localhost:5000/api/admin/room-types', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Room Types Count:', data.length);
        console.log('Sample Room Type:', JSON.stringify(data[0], null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    }
};
test();
