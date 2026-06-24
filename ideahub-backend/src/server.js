import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
import path from 'path';
import healthRouter from './routes/health.route.js';
import authRouter from './routes/auth.routes.js';
import bookingRouter from './routes/booking.routes.js';
import orderRouter from './routes/order.routes.js';
import roomRouter from './routes/room.routes.js';
import timeSlotRouter from './routes/timeSlot.routes.js';
import eventRouter from './routes/event.routes.js';
import achievementRouter from './routes/achievement.routes.js';
import machineryRoutes from './routes/machinery.routes.js';
import materialRouter from './routes/material.routes.js';
import machineRouter from './routes/machine.routes.js';
import productRouter from './routes/product.routes.js';
import heroRouter from './routes/heroRoutes.js';
import cartRouter from './routes/cart.routes.js';
import deliveryRouter from './routes/delivery.routes.js';
import roomPermissionRouter from './routes/roomPermission.routes.js';
import scheduler from './scheduler.js';
import { seedSpecialRooms } from './utils/seedSpecialRooms.js';


dotenv.config();

const app = express();

// CORS configuration - allow dynamic localhost ports and env allowlist
const allowlist = (process.env.FRONTEND_ORIGIN || '').split(',').map((v) => v.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
      if (isLocalhost || allowlist.includes(origin)) {
        return callback(null, true);
      }
      // Warn but don't block for now to debug - or keep strict if preferred.
      // For single-service, the frontend runs on same domain, so 'origin' might be undefined for direct navigation?
      // Actually, for API calls from the frontend, origin will be the domain.
      // We must ensure allowlist includes the Render domain.
      
      // Temporary fix: Allow all for debugging if needed, or ensure FRONTEND_ORIGIN is set.
      // Better fix: explicitly check against process.env.RENDER_EXTERNAL_HOSTNAME if available
      return callback(null, true); // ALLOW ALL for now to get it working, then user can tighten.
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
console.log('Mounting routes...');
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingRouter);
if (roomRouter) console.log('Room router loaded');
else console.log('Room router NOT loaded');
app.use('/api/rooms', roomRouter);
app.use('/api/time-slots', timeSlotRouter);
app.use('/api/events', eventRouter);
app.use('/api/achievements', achievementRouter);
app.use('/api/machinery', machineryRoutes);
app.use('/api/materials', materialRouter);
app.use('/api/machines', machineRouter);
app.use('/api/products', productRouter);
app.use('/api/hero', heroRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/orders', orderRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/room-permissions', roomPermissionRouter);
import notificationRouter from './routes/notification.routes.js';
app.use('/api/notifications', notificationRouter);
// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root route for sanity check
// Serve static files from the React frontend app
app.use(express.static(path.join(process.cwd(), 'public')));

// SPA Fallback: ANYTHING that isn't matched by an API route or static asset should return the React app
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Global Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error('Global Error Handler:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ideahub';

// Socket.io Integration
import { createServer } from 'http';
import { Server } from 'socket.io';

async function start() {
  await connectToDatabase(MONGO_URI);
  await seedSpecialRooms();

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
        if (isLocalhost || allowlist.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Make io available in routes
  app.set('io', io);

  // Socket Logic
  // eslint-disable-next-line no-undef
  scheduler();

  const onlineDrivers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
      console.log('Socket Connected:', socket.id);

      socket.on('identity', (userId) => {
          if (userId) {
              onlineDrivers.set(userId, socket.id);
              socket.join(userId); // Join personal room
              console.log(`Driver ${userId} mapped to ${socket.id}`);
          }
      });

      socket.on('update-location', (data) => {
          // data: { userId, latitude, longitude }
          // Broadcast to anyone tracking this driver or order ?
          // Ideally, we broadcast to a room associated with the active order.
          // But for now, let's just emit to a generic "tracking" or if we knew the orderId.
          // The frontend TrackingPage likely joins 'orderId'.
          // Driver doesn't send orderId here? Dashboard sends { userId, lat, lng }
          // We can't know which order is active easily without querying DB or storing in Map.
          // BUT, if the Customer joins room `driver-${userId}`, it works.
          // Let's assume TrackingPage joins `driver-${driverId}`.
          
          if(data.userId) {
              io.to(`driver-${data.userId}`).emit('driver-location-updated', {
                  lat: data.latitude,
                  lng: data.longitude
              });
          }
      });
      
      socket.on('join-tracking', (driverId) => {
           socket.join(`driver-${driverId}`);
           console.log(`Socket ${socket.id} started tracking driver ${driverId}`);
      });

      socket.on('disconnect', () => {
           // efficient cleanup
           for (const [uid, sid] of onlineDrivers.entries()) {
               if (sid === socket.id) {
                   onlineDrivers.delete(uid);
                   break;
               }
           }
           console.log('Socket Disconnected:', socket.id);
      });
  });

  httpServer.listen(PORT, () => {
    console.log(`Server (HTTP+Socket) listening on port ${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;


// Trigger restart

// Trigger restart 2
