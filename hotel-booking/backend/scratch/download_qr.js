import fs from 'fs';
import http from 'http';
import https from 'https';

const url = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BOOKINGX_CHECKIN_TOKEN=QR_CHECKIN_TEST12345';
const file = fs.createWriteStream('test_qr.png');

https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('✅ QR Code downloaded successfully as test_qr.png');
  });
}).on('error', function(err) {
  fs.unlink('test_qr.png', () => {});
  console.error('Download failed:', err.message);
});
