import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
import healthRouter from './routes/health.route.js';
import authRouter from './routes/auth.routes.js';
import bookingRouter from './routes/booking.routes.js';

dotenv.config();

const app = express();

// CORS configuration - allow dynamic localhost ports and env allowlist
const allowlist = (process.env.FRONTEND_ORIGIN || '').split(',').map((v) => v.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
      if (isLocalhost || allowlist.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Basic middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Minimal request logger to verify requests hit the backend
app.use((req, _res, next) => {
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingRouter);

// Root route for sanity check
app.get('/', (_req, res) => {
  res.status(200).send('IDEA HUB backend is running');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

async function start() {
  if (!MONGO_URI) {
    // eslint-disable-next-line no-console
    console.error('MONGO_URI not set. Please configure it in .env');
    process.exit(1);
  }
  await connectToDatabase(MONGO_URI);
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;

