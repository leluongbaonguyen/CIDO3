import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../../../frontend/public/images');

const assets = {
  rooms: [
    { name: 'std-1.jpg', url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80' },
    { name: 'std-2.jpg', url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80' },
    { name: 'deluxe-1.jpg', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80' },
    { name: 'deluxe-2.jpg', url: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80' },
    { name: 'suite-1.jpg', url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80' },
    { name: 'suite-2.jpg', url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80' },
    { name: 'penthouse-1.jpg', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80' },
    { name: 'penthouse-2.jpg', url: 'https://images.unsplash.com/photo-1600607687940-c52af096999a?auto=format&fit=crop&w=1200&q=80' },
    { name: 'pool-view.jpg', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80' },
    { name: 'ocean-view.jpg', url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80' }
  ],
  avatars: [
    { name: 'admin.jpg', url: 'https://i.pravatar.cc/300?u=admin' },
    { name: 'staff-m.jpg', url: 'https://i.pravatar.cc/300?u=male' },
    { name: 'staff-f.jpg', url: 'https://i.pravatar.cc/300?u=female' }
  ]
};

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  console.log('📂 --- ĐANG TẢI TÀI NGUYÊN HÌNH ẢNH VỀ MÁY --- 📂');
  
  for (const category in assets) {
    const dir = path.join(PUBLIC_DIR, category);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    for (const item of assets[category]) {
      const dest = path.join(dir, item.name);
      console.log(`Downloading: ${item.name}...`);
      try {
        await downloadFile(item.url, dest);
      } catch (err) {
        console.error(`Error downloading ${item.name}:`, err.message);
      }
    }
  }
  
  console.log('✅ --- HOÀN TẤT TẢI HÌNH ẢNH --- ✅');
}

main();
