import express from 'express';
import { createServer as createViteServer } from 'vite';
import { db, reservations, rooms, customHolidays } from './src/db';
import { eq, and, lt, gt, ne, asc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import path from 'path';
import crypto from 'crypto';

let clients: express.Response[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Memory Fallback Storage
  let memoryReservations: any[] = [];
  let memoryRooms: any[] = [
    { 
      id: 'room_10f', name: '10층', capacity: 8, 
      color: 'indigo', header_bg: 'bg-indigo-500', accent_bg: 'bg-indigo-50/50', 
      border_color: 'border-indigo-200', text_color: 'text-indigo-700', order: 1 
    },
    { 
      id: 'room_9f', name: '9층', capacity: 12, 
      color: 'emerald', header_bg: 'bg-emerald-500', accent_bg: 'bg-emerald-50/50', 
      border_color: 'border-emerald-200', text_color: 'text-emerald-700', order: 2 
    },
    { 
      id: 'room_8f_l', name: '8층(대)', capacity: 12, 
      color: 'rose', header_bg: 'bg-rose-500', accent_bg: 'bg-rose-50/50', 
      border_color: 'border-rose-200', text_color: 'text-rose-700', order: 3 
    },
    { 
      id: 'room_8f_s', name: '8층(소)', capacity: 6, 
      color: 'amber', header_bg: 'bg-amber-500', accent_bg: 'bg-amber-50/50', 
      border_color: 'border-amber-200', text_color: 'text-amber-700', order: 4 
    },
  ];
  let memoryHolidays: any[] = [];

  const isDbConnected = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);

  // Initialize Postgres Tables
  const initDb = async () => {
    if (!isDbConnected) return;
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS reservations (
          id TEXT PRIMARY KEY,
          room_id TEXT NOT NULL,
          reserver TEXT NOT NULL,
          description TEXT NOT NULL,
          start_time TIMESTAMP WITH TIME ZONE NOT NULL,
          end_time TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rooms (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          capacity INTEGER NOT NULL,
          color TEXT NOT NULL,
          header_bg TEXT NOT NULL,
          accent_bg TEXT NOT NULL,
          border_color TEXT NOT NULL,
          text_color TEXT NOT NULL,
          "order" INTEGER DEFAULT 0
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS custom_holidays (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed Initial Rooms if empty
      const existingRooms = await db.select().from(rooms);
      if (existingRooms.length === 0) {
        await db.insert(rooms).values(memoryRooms);
        console.log("Rooms seeded to Postgres");
      }

      console.log("Postgres tables initialized via Drizzle");
    } catch (e) {
      console.error("Failed to initialize Postgres table:", e);
    }
  };
  
  initDb();

  // API Routes
  
  // Real-time Event Stream (SSE)
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendPing = setInterval(() => {
      res.write(': ping\n\n');
    }, 30000);

    clients.push(res);

    req.on('close', () => {
      clearInterval(sendPing);
      clients = clients.filter(c => c !== res);
    });
  });

  const broadcastUpdate = () => {
    clients.forEach(c => c.write(`data: update\n\n`));
  };

  app.get('/api/debug', (req, res) => {
    res.json({
      databaseConnected: isDbConnected,
      env: process.env.NODE_ENV,
      dbProvider: isDbConnected ? 'Postgres/Neon' : 'In-Memory (Demo Mode)'
    });
  });

  // Reservoir handlers
  app.get('/api/reservations', async (req, res) => {
    try {
      if (!isDbConnected) {
        return res.json(memoryReservations);
      }
      const all = await db.query.reservations.findMany({
        orderBy: (res, { asc }) => [asc(res.start_time)],
      });
      res.json(all);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Room Endpoints
  app.get('/api/rooms', async (req, res) => {
    try {
      if (!isDbConnected) {
        return res.json(memoryRooms.sort((a, b) => a.order - b.order));
      }
      const allRooms = await db.select().from(rooms).orderBy(asc(rooms.order));
      res.json(allRooms);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/rooms', async (req, res) => {
    try {
      const roomData = req.body;
      if (!roomData.id) roomData.id = crypto.randomUUID();
      
      if (!isDbConnected) {
        const idx = memoryRooms.findIndex(r => r.id === roomData.id);
        if (idx >= 0) memoryRooms[idx] = roomData;
        else memoryRooms.push(roomData);
        broadcastUpdate();
        return res.json({ success: true });
      }

      await db.insert(rooms).values(roomData).onConflictDoUpdate({
        target: rooms.id,
        set: roomData
      });
      broadcastUpdate();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/rooms/:id', async (req, res) => {
    try {
      if (!isDbConnected) {
        memoryRooms = memoryRooms.filter(r => r.id !== req.params.id);
        broadcastUpdate();
        return res.json({ success: true });
      }
      await db.delete(rooms).where(eq(rooms.id, req.params.id));
      broadcastUpdate();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Holiday Endpoints
  app.get('/api/holidays', async (req, res) => {
    try {
      if (!isDbConnected) {
        return res.json(memoryHolidays.sort((a, b) => a.date.localeCompare(b.date)));
      }
      const allHolidays = await db.select().from(customHolidays).orderBy(asc(customHolidays.date));
      res.json(allHolidays);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/holidays', async (req, res) => {
    try {
      const { date, name } = req.body;
      const id = crypto.randomUUID();
      
      if (!isDbConnected) {
        memoryHolidays.push({ id, date, name });
        broadcastUpdate();
        return res.json({ success: true, id });
      }

      await db.insert(customHolidays).values({ id, date, name });
      broadcastUpdate();
      res.json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/holidays/:id', async (req, res) => {
    try {
      if (!isDbConnected) {
        memoryHolidays = memoryHolidays.filter(h => h.id !== req.params.id);
        broadcastUpdate();
        return res.json({ success: true });
      }
      await db.delete(customHolidays).where(eq(customHolidays.id, req.params.id));
      broadcastUpdate();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/reservations', async (req, res) => {
    const { room_id, reserver, description, start_time, end_time } = req.body;
    
    try {
      if (!isDbConnected) {
        const overlap = memoryReservations.filter(r => 
          r.room_id === room_id &&
          new Date(r.start_time) < new Date(end_time) &&
          new Date(r.end_time) > new Date(start_time)
        );
        if (overlap.length > 0) return res.status(409).json({ error: "해당 시각에는 이미 예약이 있습니다." });
        
        const id = crypto.randomUUID();
        memoryReservations.push({ id, room_id, reserver, description, start_time, end_time });
        broadcastUpdate();
        return res.status(201).json({ success: true, id });
      }

      // Check for overlap using Drizzle
      const overlap = await db.query.reservations.findMany({
        where: and(
          eq(reservations.room_id, room_id),
          lt(reservations.start_time, new Date(end_time)),
          gt(reservations.end_time, new Date(start_time))
        ),
      });

      if (overlap.length > 0) {
        return res.status(409).json({ error: "해당 시각에는 이미 예약이 있습니다." });
      }

      const id = crypto.randomUUID();
      await db.insert(reservations).values({
        id,
        room_id,
        reserver,
        description,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
      });
      
      broadcastUpdate();
      res.status(201).json({ success: true, id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/reservations/:id', async (req, res) => {
    const { room_id, reserver, description, start_time, end_time } = req.body;
    const { id } = req.params;
    
    try {
      if (!isDbConnected) {
        const overlap = memoryReservations.filter(r => 
          r.id !== id &&
          r.room_id === room_id &&
          new Date(r.start_time) < new Date(end_time) &&
          new Date(r.end_time) > new Date(start_time)
        );
        if (overlap.length > 0) return res.status(409).json({ error: "해당 시각에는 이미 예약이 있습니다." });
        
        const idx = memoryReservations.findIndex(r => r.id === id);
        if (idx >= 0) memoryReservations[idx] = { id, room_id, reserver, description, start_time, end_time };
        broadcastUpdate();
        return res.json({ success: true });
      }

      // Check for overlap (excluding current reservation) using Drizzle
      const overlap = await db.query.reservations.findMany({
        where: and(
          ne(reservations.id, id),
          eq(reservations.room_id, room_id),
          lt(reservations.start_time, new Date(end_time)),
          gt(reservations.end_time, new Date(start_time))
        ),
      });
      
      if (overlap.length > 0) {
        return res.status(409).json({ error: "해당 시각에는 이미 예약이 있습니다." });
      }

      await db.update(reservations)
        .set({
          room_id,
          reserver,
          description,
          start_time: new Date(start_time),
          end_time: new Date(end_time),
        })
        .where(eq(reservations.id, id));
      
      broadcastUpdate();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/reservations/:id', async (req, res) => {
    const { id } = req.params;
    try {
      if (!isDbConnected) {
        memoryReservations = memoryReservations.filter(r => r.id !== id);
        broadcastUpdate();
        return res.json({ success: true });
      }
      await db.delete(reservations).where(eq(reservations.id, id));
      broadcastUpdate();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
