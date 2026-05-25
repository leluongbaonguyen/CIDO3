import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import path from 'path';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import roomRoutes from './routes/room.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import adminRoutes from './routes/admin.routes.js';
import chatRoutes from './routes/chat.routes.js';
import { errorHandler, notFound } from './middlewares/error.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like postman/curl/mobile apps)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed list or is a local host address
    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    if (allowedOrigins.includes(origin) || isLocalhost) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
