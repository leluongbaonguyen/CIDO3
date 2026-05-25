const test = async () => {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@xtravel.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Data:', JSON.stringify(loginData, null, 2));
        
        const token = loginData.token;
        if (!token) {
            console.log('❌ NO TOKEN RETURNED');
            return;
        }

        console.log('Fetching bookings with token:', token.substring(0, 20) + '...');
        const res = await fetch('http://localhost:5000/api/admin/bookings', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(data, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    }
};

test();
